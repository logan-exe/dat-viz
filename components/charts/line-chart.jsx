"use client"

import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

/**
 * Line Chart Component
 * @param {Object} props
 * @param {Array} props.data - The data to display in the chart
 * @param {string|null} props.xAxis - The field to use for the X axis
 * @param {string|null} props.yAxis - The field to use for the Y axis
 */
export default function LineChartComponent({ data, xAxis, yAxis }) {
  if (!xAxis || !yAxis) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please select X and Y axis</p>
      </div>
    )
  }

  // Create chart config for the selected measure
  const chartConfig = {
    [yAxis]: {
      label: yAxis,
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxis}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "hsl(var(--foreground))" }}
            tickMargin={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--foreground))" }} tickMargin={10} />
          <Line
            type="monotone"
            dataKey={yAxis}
            stroke={`var(--color-${yAxis})`}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `${xAxis}: ${value}`} />} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

