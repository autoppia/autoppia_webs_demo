"use client";

import { formatDate, formatRating } from "@/library/formatters";
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface PlayerRatingChartProps {
  ratingHistory: { date: string; rating: number }[];
}

export function PlayerRatingChart({ ratingHistory }: PlayerRatingChartProps) {
  const gradientId = useId();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={ratingHistory}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
        <XAxis
          dataKey="date"
          stroke="#666"
          tick={{ fill: "#888", fontSize: 11 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
          }}
        />
        <YAxis
          stroke="#666"
          tick={{ fill: "#888", fontSize: 11 }}
          domain={["dataMin - 50", "dataMax + 50"]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1c1917",
            border: "1px solid #44403c",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#888" }}
          itemStyle={{ color: "#f59e0b" }}
          formatter={(value: number) => [formatRating(value), "Rating"]}
          labelFormatter={(label) => formatDate(label)}
        />
        <Area
          type="monotone"
          dataKey="rating"
          stroke="#f59e0b"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
