import { useState } from 'react';
import { useLiveTransactions } from '../contexts/WebSocketContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';

interface Transaction {
  id: string;
  hash: string;
  type: 'buy' | 'sell';
  tokenName: string;
  tokenSymbol: string;
  amount: number;
  amountUsd: number;
  price: number;
  blockchain: 'solana' | 'ethereum' | 'bsc';
  userName?: string;
  timestamp: string;
}

interface LiveTransactionFeedProps {
  maxItems?: number;
  showToastForLarge?: boolean;
  largeThreshold?: number;
}

export function LiveTransactionFeed({
  maxItems = 50,
  showToastForLarge = true,
  largeThreshold = 10000,
}: LiveTransactionFeedProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useLiveTransactions((transaction: Transaction) => {
    if (isPaused) return;

    setTransactions(prev => [transaction, ...prev].slice(0, maxItems));

    // Show toast for large transactions
    if (showToastForLarge && transaction.amountUsd >= largeThreshold) {
      toast.success(
        `🚀 Large ${transaction.type}: $${transaction.amountUsd.toLocaleString()} in ${transaction.tokenSymbol}`,
        { autoClose: 8000 }
      );
    }
  });

  const getChainIcon = (blockchain: string) => {
    switch (blockchain) {
      case 'solana':
        return '◎';
      case 'ethereum':
        return 'Ξ';
      case 'bsc':
        return 'Ⓑ';
      default:
        return '◆';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'buy'
      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold dark:text-white">Live Transactions</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
            </div>
          </div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p>Waiting for live transactions...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((tx, index) => (
              <div
                key={`${tx.id}-${index}`}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-fade-in"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Type and Token Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(
                          tx.type
                        )}`}
                      >
                        {tx.type.toUpperCase()}
                      </span>
                      <span className="text-sm font-medium dark:text-white truncate">
                        {tx.tokenName} ({tx.tokenSymbol})
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getChainIcon(tx.blockchain)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
                        {tx.tokenSymbol}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${tx.amountUsd.toLocaleString()}
                      </span>
                      {tx.userName && (
                        <>
                          <span>•</span>
                          <span className="truncate">@{tx.userName}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 truncate">
                      {tx.hash}
                    </div>
                  </div>

                  {/* Right: Time */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {transactions.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{transactions.length} transactions</span>
            <span>
              Total: $
              {transactions
                .reduce((sum, tx) => sum + tx.amountUsd, 0)
                .toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
