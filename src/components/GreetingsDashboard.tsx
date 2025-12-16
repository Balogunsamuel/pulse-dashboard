import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

interface Greeting {
  id: string;
  groupId: string;
  message: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function GreetingsDashboard() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [greeting, setGreeting] = useState<Greeting | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGreeting();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to fetch groups');
    }
  };

  const fetchGreeting = async () => {
    try {
      setLoading(true);
      const data = await api.getGreeting(selectedGroup);
      setGreeting(data);
      setMessage(data?.message || '');
    } catch (err) {
      toast.error('Failed to fetch greeting');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!message.trim()) {
      toast.error('Please enter a greeting message');
      return;
    }

    try {
      setSaving(true);
      await api.updateGreeting(selectedGroup, message);
      toast.success('Greeting saved successfully!');
      fetchGreeting();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save greeting');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this greeting?')) return;

    try {
      setSaving(true);
      await api.deleteGreeting(selectedGroup);
      toast.success('Greeting deleted successfully!');
      setMessage('');
      setGreeting(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete greeting');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('greeting-message') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = message;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setMessage(before + variable + after);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const variables = [
    { name: 'User First Name', value: '{firstName}', description: 'The first name of the new member' },
    { name: 'Username', value: '{username}', description: 'The @username of the new member' },
    { name: 'User ID', value: '{userId}', description: 'Telegram user ID' },
    { name: 'Group Name', value: '{groupName}', description: 'The name of the group' },
    { name: 'Member Count', value: '{memberCount}', description: 'Total members in the group' },
  ];

  const previewMessage = message
    .replace(/{firstName}/g, 'John')
    .replace(/{username}/g, '@johndoe')
    .replace(/{userId}/g, '123456789')
    .replace(/{groupName}/g, groups.find(g => g.id === selectedGroup)?.title || 'Crypto Community')
    .replace(/{memberCount}/g, '1,234');

  if (loading && !greeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading greeting data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Greetings Management</h2>
          <p className="text-sm text-gray-500 mt-1">Customize welcome messages for new members</p>
        </div>
      </div>

      {/* Group Selector */}
      {groups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Message Editor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Greeting Message</h3>

            <textarea
              id="greeting-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your welcome message here... Use variables like {firstName}, {username}, etc."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm resize-none"
            />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {message.length} characters
              </div>
              <div className="flex gap-2">
                {greeting && (
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving || !message.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saving ? 'Saving...' : 'Save Greeting'}
                </button>
              </div>
            </div>
          </div>

          {/* Variables Reference */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variables.map((variable) => (
                <div
                  key={variable.value}
                  className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition"
                  onClick={() => insertVariable(variable.value)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-900">{variable.name}</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-primary-600">
                      {variable.value}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500">{variable.description}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">Click on any variable to insert it at cursor position</p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>

            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[300px]">
              {/* Telegram-style preview */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                    J
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">John Doe</div>
                    <div className="text-xs text-gray-500">@johndoe</div>
                  </div>
                </div>

                {previewMessage ? (
                  <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                    {previewMessage}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">
                    No message configured. Start typing to see preview...
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Preview uses sample data.</strong> Actual greeting will show real user information when new members join.
                </p>
              </div>
            </div>

            {/* Status */}
            {greeting && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-green-800">Greeting Active</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Last updated: {new Date(greeting.updatedAt).toLocaleString()}
                </p>
              </div>
            )}

            {!greeting && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-yellow-800">No Greeting Set</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  New members won't receive a welcome message
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
