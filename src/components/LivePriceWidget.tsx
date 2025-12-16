import { useState } from 'react';
import { useLivePrices } from '../contexts/WebSocketContext';

interface TokenPrice {
  address: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: string;
}

interface LivePriceWidgetProps {
  tokenAddresses?: string[];
}

export function LivePriceWidget({}: LivePriceWidgetProps) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});

  useLivePrices((priceUpdate: TokenPrice) => {
    setPrices(prev => ({
      ...prev,
      [priceUpdate.address]: priceUpdate,
    }));
  });

  const priceList = Object.values(prices);

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">Live Prices</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
          </div>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {priceList.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">💰</div>
            <p>Waiting for price updates...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {priceList.map(token => (
              <div
                key={token.address}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Token Info */}
                  <div className="flex-1">
                    <div className="font-medium dark:text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {token.name}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="font-semibold dark:text-white">
                      ${token.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                    <div className={`text-sm font-medium ${getPriceChangeColor(token.change24h)}`}>
                      {getPriceChangeIcon(token.change24h)}{' '}
                      {Math.abs(token.change24h).toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* 24h Stats */}
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">24h High</div>
                    <div className="font-medium dark:text-white">
                      ${token.high24h.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">24h Low</div>
                    <div className="font-medium dark:text-white">
                      ${token.low24h.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400">24h Volume</div>
                    <div className="font-medium dark:text-white">
                      ${(token.volume24h / 1000).toFixed(1)}K
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
