import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { TrendPoint, CategoryValue } from "../types";
import { formatNaira } from "../lib/format";

const PIE_COLORS = ["#C89B4A", "#5FAE82", "#6C8AE4", "#C1613F", "#9A7BD1", "#4FB0B0"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-panel2 border border-hairline rounded-lg px-3 py-2 text-xs shadow-panel">
      <p className="text-muted font-mono mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-mono">
          {p.name}: {formatNaira(p.value)}
        </p>
      ))}
    </div>
  );
}

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C89B4A" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#C89B4A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#272B35" strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey="date" stroke="#8B8F99" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#8B8F99"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatNaira(v)}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C89B4A" strokeWidth={2} fill="url(#revGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: CategoryValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="#272B35" strokeDasharray="3 4" vertical={false} />
        <XAxis dataKey="category" stroke="#8B8F99" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#8B8F99"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatNaira(v)}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="value" name="Sales" fill="#5FAE82" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ExpenseDonutChart({ data }: { data: CategoryValue[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="category"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          iconType="circle"
          wrapperStyle={{ fontSize: 11, color: "#8B8F99" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
