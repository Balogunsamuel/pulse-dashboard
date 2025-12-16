import { useWebSocket, WebSocketStatus as Status } from '../contexts/WebSocketContext';

export function WebSocketStatus() {
  const { status, reconnect } = useWebSocket();

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Status) => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const showReconnect = status === 'disconnected' || status === 'error';

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {getStatusText(status)}
        </span>
      </div>
      {showReconnect && (
        <button
          onClick={reconnect}
          className="text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Reconnect
        </button>
      )}
    </div>
  );
}
