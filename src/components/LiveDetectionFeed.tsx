import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface SecurityEvent {
  id: string;
  type: 'violation' | 'raid' | 'scam';
  userId?: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved?: boolean;
}

interface LiveDetectionFeedProps {
  groupId: string;
  refreshInterval?: number;
}

export default function LiveDetectionFeed({ groupId, refreshInterval = 10000 }: LiveDetectionFeedProps) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;

    fetchEvents();
    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [groupId, refreshInterval]);

  const fetchEvents = async () => {
    try {
      const data = await api.getSecurityEvents(groupId, 20);
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch security events:', err);
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'raid':
        return '🚨';
      case 'violation':
        return '⚠️';
      case 'scam':
        return '🛡️';
      default:
        return '📋';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'raid':
        return 'Raid Detected';
      case 'violation':
        return 'Spam Violation';
      case 'scam':
        return 'Scam Pattern';
      default:
        return 'Security Event';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading detection feed...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Detection Feed</h3>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No security events</h3>
          <p className="mt-1 text-sm text-gray-500">Your group is secure. No threats detected recently.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Live Detection Feed</h3>
          <p className="text-sm text-gray-500">Real-time security events and threats</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live</span>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {events.map((event) => (
            <div key={event.id} className="px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-2xl">{getTypeIcon(event.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{getTypeLabel(event.type)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    {event.resolved && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                        RESOLVED
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{event.details}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {event.userId && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        User: {event.userId.slice(0, 8)}...
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
