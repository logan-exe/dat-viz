"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

/**
 * Pie Chart Component
 * @param {Object} props
 * @param {Array} props.data - The data to display in the chart
 * @param {string|null} props.dimension - The field to use for the dimension
 * @param {string|null} props.measure - The field to use for the measure
 */
export default function PieChartComponent({ data, dimension, measure }) {
  if (!dimension || !measure) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please select dimension and measure</p>
      </div>
    )
  }

  // Create chart config for the selected measure
  const chartConfig = {
    [measure]: {
      label: measure,
      color: "hsl(var(--chart-1))",
    },
  }

  // Generate colors for pie slices
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
  ]

  // Process data for pie chart - aggregate by dimension
  const processedData = data.reduce((acc, item) => {
    const key = item[dimension]
    if (!acc[key]) {
      acc[key] = { [dimension]: key, [measure]: 0 }
    }
    acc[key][measure] += item[measure]
    return acc
  }, {})

  const pieData = Object.values(processedData)

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={pieData}
            dataKey={measure}
            nameKey={dimension}
            cx="50%"
            cy="50%"
            outerRadius={150}
            innerRadius={60}
            paddingAngle={2}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={true}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) => `${dimension}: ${value}`}
                formatter={(value) => [`${value}`, measure]}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

