"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Interface dos dados que vêm do Backend
interface ChartData {
  name: string; // Ex: "Jan"
  faturamento: number;
  servicos: number;
}

interface RevenueChartProps {
  data: ChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#27272a"
        />

        <XAxis
          dataKey="name"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        <YAxis
          yAxisId="left"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value}`}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#71717a"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "8px",
          }}
          itemStyle={{ color: "#fff" }}
          cursor={{ fill: "#27272a", opacity: 0.4 }}
          formatter={(value: any, name: any) => {
            if (value === undefined) return ["-", name];
            if (name === "Faturamento (R$)")
              return [`R$ ${Number(value).toFixed(2)}`, name];
            return [value, name];
          }}
        />

        <Legend verticalAlign="top" height={36} iconType="circle" />

        <Bar
          yAxisId="left"
          dataKey="faturamento"
          name="Faturamento (R$)"
          fill="#ffffff"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />

        <Bar
          yAxisId="right"
          dataKey="servicos"
          name="Qtd. Serviços"
          fill="#52525b"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
