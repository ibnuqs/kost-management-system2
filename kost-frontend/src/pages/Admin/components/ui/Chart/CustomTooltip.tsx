// File: src/pages/Admin/components/ui/Chart/CustomTooltip.tsx
import React from 'react';
import { chartTheme, formatCurrency, formatNumber } from '../../../utils/chartTheme';

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatValue?: (value: number) => string;
  showLabel?: boolean;
}

export const CustomTooltip: React.FC<TooltipProps> = ({
  active,
  payload,
  label,
  formatValue = formatNumber,
  showLabel = true,
}) => {
  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border-0">
      {showLabel && label && (
        <p className="font-medium mb-2">{label}</p>
      )}
      {payload.map((entry: any, index: number) => {
        if (entry.value == null) return null;
        
        return (
          <p key={index} className="text-sm flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: entry.color }}
            />
            <span className="flex-1">{entry.name || entry.dataKey}:</span>
            <span className="font-medium">
              {formatValue(entry.value)}
            </span>
          </p>
        );
      })}
    </div>
  );
};

export const CurrencyTooltip: React.FC<TooltipProps> = (props) => (
  <CustomTooltip {...props} formatValue={formatCurrency} />
);

export const PieTooltip: React.FC<TooltipProps> = ({
  active,
  payload,
}) => {
  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const data = payload[0];
  
  return (
    <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border-0">
      <p className="font-medium">{data.name}</p>
      <p className="text-sm flex items-center gap-2 mt-1">
        <span
          className="w-3 h-3 rounded-full inline-block"
          style={{ backgroundColor: data.payload.color || data.color }}
        />
        <span>Jumlah: {formatNumber(data.value)}</span>
      </p>
      {data.payload.percentage && (
        <p className="text-xs text-gray-300 mt-1">
          {data.payload.percentage.toFixed(1)}% dari total
        </p>
      )}
    </div>
  );
};