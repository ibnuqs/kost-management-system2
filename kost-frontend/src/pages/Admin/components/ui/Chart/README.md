# Standardized Chart System

Sistem chart yang ter-standardisasi untuk dashboard admin dengan styling yang konsisten dan komponen yang reusable.

## Komponen Utama

### 1. ChartContainer
Container universal untuk semua chart dengan handling loading, error, dan empty state yang konsisten.

```tsx
import { ChartContainer } from '../ui/Chart';

<ChartContainer
  title="Judul Chart"
  subtitle="Deskripsi chart"
  icon={IconComponent}
  isLoading={isLoading}
  error={error}
  onRetry={onRetry}
  actions={<CustomActions />}
>
  {/* Chart content */}
</ChartContainer>
```

### 2. StatCard
Kartu statistik dengan styling yang konsisten dan mendukung berbagai tipe (success, warning, danger, info, neutral).

```tsx
import { StatCard } from '../ui/Chart';

<StatCard
  title="Total Revenue"
  value={formatCurrency(1500000)}
  icon={TrendingUp}
  type="success"
  trend={{
    value: 15.2,
    isPositive: true
  }}
/>
```

### 3. CustomTooltip
Tooltip yang ter-standardisasi untuk semua chart dengan formatting yang konsisten.

```tsx
import { CustomTooltip, CurrencyTooltip, PieTooltip } from '../ui/Chart';

// Basic tooltip
<CustomTooltip />

// Currency tooltip
<CurrencyTooltip />

// Pie chart tooltip
<PieTooltip />
```

## Theme System

### Color Palette
```typescript
const chartTheme = {
  colors: {
    primary: '#3b82f6',    // Blue
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Orange
    danger: '#ef4444',     // Red
    info: '#8b5cf6',       // Purple
    neutral: '#6b7280',    // Gray
  }
}
```

### Color Schemes
Pre-defined color schemes untuk berbagai jenis data:

```typescript
// Payment status colors
chartColorSchemes.paymentStatus // [success, warning, danger]

// Access status colors  
chartColorSchemes.accessStatus  // [success, danger]

// Revenue colors
chartColorSchemes.revenue       // [primary]

// Multi-category colors
chartColorSchemes.multiCategory // 8 colors for varied data
```

## Chart Styling Standards

### 1. Consistent Grid & Axes
```typescript
<CartesianGrid {...chartTheme.chartDefaults.grid} />
<XAxis {...chartTheme.chartDefaults.axis} />
<YAxis {...chartTheme.chartDefaults.axis} />
```

### 2. Standardized Tooltips
```typescript
// Number formatting
<CustomTooltip formatValue={formatNumber} />

// Currency formatting  
<CurrencyTooltip />

// Pie chart data
<PieTooltip />
```

### 3. Consistent Colors
```typescript
// Use color schemes
stroke={chartColorSchemes.paymentStatus[0]}

// Or direct theme colors
fill={chartTheme.colors.success}
```

## Helper Functions

### Formatting
- `formatCurrency(value)` - Format angka menjadi mata uang Rupiah
- `formatNumber(value)` - Format angka dengan K/M notation
- `formatPercentage(value)` - Format persentase dengan 1 decimal

### Styling Helpers
- `getStatCardStyle(type)` - CSS classes untuk stat cards
- `getIconStyle(type)` - CSS classes untuk icons
- `getTextStyle(type, variant)` - CSS classes untuk text

## Usage Examples

### Revenue Chart
```tsx
import { ChartContainer, StatCard, CurrencyTooltip } from '../ui/Chart';
import { chartTheme, formatCurrency } from '../../utils/chartTheme';

const RevenueChart = ({ data, isLoading }) => (
  <ChartContainer
    title="Revenue Analysis"
    icon={TrendingUp}
    isLoading={isLoading}
  >
    <div className="grid grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon={TrendingUp}
        type="success"
      />
    </div>
    
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid {...chartTheme.chartDefaults.grid} />
        <XAxis {...chartTheme.chartDefaults.axis} />
        <YAxis {...chartTheme.chartDefaults.axis} />
        <CurrencyTooltip />
        <Line
          dataKey="revenue"
          stroke={chartTheme.colors.primary}
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
);
```

### Payment Status Chart
```tsx
const PaymentChart = ({ data, isLoading }) => (
  <ChartContainer
    title="Payment Status"
    icon={CreditCard}
    isLoading={isLoading}
  >
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
        >
          {pieData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={chartColorSchemes.paymentStatus[index]} 
            />
          ))}
        </Pie>
        <PieTooltip />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
);
```

## Benefits

1. **Consistency** - Semua chart menggunakan color palette dan styling yang sama
2. **Reusability** - Components dapat digunakan kembali di berbagai chart
3. **Maintainability** - Perubahan theme dapat dilakukan di satu tempat
4. **Performance** - Loading, error, dan empty states yang efisien
5. **Accessibility** - Consistent contrast ratios dan readable fonts
6. **Responsive** - Auto-responsive dengan breakpoint yang konsisten

## Migration Guide

Untuk mengupdate chart yang sudah ada:

1. Import chart components yang baru:
```tsx
import { ChartContainer, StatCard, CustomTooltip } from '../ui/Chart';
import { chartTheme, chartColorSchemes } from '../../utils/chartTheme';
```

2. Replace container dengan ChartContainer:
```tsx
// Before
<div className="bg-white rounded-xl p-6">
  <h3>Chart Title</h3>
  {/* chart content */}
</div>

// After  
<ChartContainer title="Chart Title" isLoading={isLoading}>
  {/* chart content */}
</ChartContainer>
```

3. Replace stat cards dengan StatCard:
```tsx
// Before
<div className="bg-green-50 border border-green-200 rounded-lg p-3">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-green-700 font-medium">Total</p>
      <p className="text-lg font-bold text-green-900">{value}</p>
    </div>
    <Icon className="w-5 h-5 text-green-500" />
  </div>
</div>

// After
<StatCard
  title="Total"
  value={value}
  icon={Icon}
  type="success"
/>
```

4. Update chart styling:
```tsx
// Before
<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
<XAxis stroke="#6b7280" fontSize={12} />

// After
<CartesianGrid {...chartTheme.chartDefaults.grid} />
<XAxis {...chartTheme.chartDefaults.axis} />
```

5. Use standardized colors:
```tsx
// Before
<Line stroke="#3b82f6" />
<Bar fill="#10b981" />

// After
<Line stroke={chartTheme.colors.primary} />
<Bar fill={chartColorSchemes.paymentStatus[0]} />
```