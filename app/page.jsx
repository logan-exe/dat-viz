"use client"

import { useEffect, useState } from "react"
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { BarChart2, LineChartIcon, PieChartIcon } from "lucide-react"
import { sampleData } from "./sample-data"

// Draggable Field Component
function DraggableField({ id, label, type }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }
    : {
        cursor: "grab",
      }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center justify-between rounded-md border bg-white p-2 text-sm mb-2 shadow-sm"
    >
      <div className="flex items-center">
        <span
          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${
            type === "dimension" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          {type.charAt(0).toUpperCase()}
        </span>
        <span>{label}</span>
      </div>
    </div>
  )
}

// Drop Zone Component
function DropZone({ id, label, value, acceptType }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  const style = {
    backgroundColor: isOver ? "rgba(59, 130, 246, 0.1)" : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex min-w-24 items-center rounded-md border border-dashed p-2 text-sm transition-colors mr-2 mb-2"
    >
      <span className="mr-2 text-xs text-gray-500">{label}:</span>
      {value ? (
        <span
          className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium ${
            acceptType === "dimension" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          {value}
        </span>
      ) : (
        <span className="text-xs italic text-gray-400">Drop {acceptType}</span>
      )}
    </div>
  )
}

// Custom Chart Tooltip
function CustomTooltip({ active, payload, label, xAxisKey, yAxisKey }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded shadow-md">
        <p className="font-medium">{`${xAxisKey}: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }

  return null
}

// Main Dashboard Component
export default function Dashboard() {
  const [fields, setFields] = useState([])
  const [config, setConfig] = useState({
    chartType: "bar",
    xAxis: null,
    yAxis: null,
    measure: null,
    dimension: null,
  })
  const [data, setData] = useState(sampleData)
  const [activeId, setActiveId] = useState(null)

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 10 },
  })

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 250, tolerance: 5 },
  })

  const sensors = useSensors(mouseSensor, touchSensor)

  // Extract fields from data on component mount
  useEffect(() => {
    if (data.length > 0) {
      const extractedFields = []
      const firstRow = data[0]

      Object.keys(firstRow).forEach((key) => {
        // Determine if field is a dimension or measure based on data type
        const value = firstRow[key]
        const type = typeof value === "number" ? "measure" : "dimension"
        extractedFields.push({ name: key, type })
      })

      setFields(extractedFields)

      // Set default configuration
      const dimensions = extractedFields.filter((f) => f.type === "dimension")
      const measures = extractedFields.filter((f) => f.type === "measure")

      if (dimensions.length > 0 && measures.length > 0) {
        setConfig({
          chartType: "bar",
          xAxis: dimensions[0].name,
          yAxis: measures[0].name,
          dimension: dimensions[0].name,
          measure: measures[0].name,
        })
      }
    }
  }, [data])

  const dimensions = fields.filter((f) => f.type === "dimension")
  const measures = fields.filter((f) => f.type === "measure")

  const handleFieldSelection = (fieldName, target) => {
    setConfig((prev) => ({
      ...prev,
      [target]: fieldName,
    }))
  }

  const handleChartTypeChange = (type) => {
    setConfig((prev) => ({
      ...prev,
      chartType: type,
    }))
  }

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (over) {
      const fieldName = active.id
      const dropZone = over.id

      // Find the field to get its type
      const field = fields.find((f) => f.name === fieldName)

      if (field) {
        // Only allow dimensions to be dropped on dimension zones and measures on measure zones
        if (field.type === "dimension" && (dropZone === "xAxis" || dropZone === "dimension")) {
          handleFieldSelection(fieldName, dropZone)
        } else if (field.type === "measure" && (dropZone === "yAxis" || dropZone === "measure")) {
          handleFieldSelection(fieldName, dropZone)
        }
      }
    }

    setActiveId(null)
  }

  // Chart rendering functions
  const renderBarChart = () => {
    if (!config.xAxis || !config.yAxis) return null

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={config.xAxis}
            tickLine={false}
            axisLine={{ stroke: "#e0e0e0" }}
            tick={{ fill: "#333" }}
            tickMargin={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tickLine={false} axisLine={{ stroke: "#e0e0e0" }} tick={{ fill: "#333" }} tickMargin={10} />
          <Tooltip content={<CustomTooltip xAxisKey={config.xAxis} />} />
          <Legend />
          <Bar dataKey={config.yAxis} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} name={config.yAxis} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderLineChart = () => {
    if (!config.xAxis || !config.yAxis) return null

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey={config.xAxis}
            tickLine={false}
            axisLine={{ stroke: "#e0e0e0" }}
            tick={{ fill: "#333" }}
            tickMargin={10}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tickLine={false} axisLine={{ stroke: "#e0e0e0" }} tick={{ fill: "#333" }} tickMargin={10} />
          <Tooltip content={<CustomTooltip xAxisKey={config.xAxis} />} />
          <Legend />
          <Line
            type="monotone"
            dataKey={config.yAxis}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={config.yAxis}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  const renderPieChart = () => {
    if (!config.dimension || !config.measure) return null

    // Process data for pie chart - aggregate by dimension
    const processedData = data.reduce((acc, item) => {
      const key = item[config.dimension]
      if (!acc[key]) {
        acc[key] = { [config.dimension]: key, [config.measure]: 0 }
      }
      acc[key][config.measure] += item[config.measure]
      return acc
    }, {})

    const pieData = Object.values(processedData)

    // Generate colors for pie slices
    const COLORS = [
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#f97316",
      "#10b981",
      "#06b6d4",
      "#f59e0b",
      "#6366f1",
      "#ef4444",
      "#84cc16",
    ]

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={pieData}
            dataKey={config.measure}
            nameKey={config.dimension}
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
          <Tooltip formatter={(value) => [`${value}`, config.measure]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderChart = () => {
    if (!config.dimension || !config.measure) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-gray-500">Please select dimension and measure to visualize data</p>
        </div>
      )
    }

    switch (config.chartType) {
      case "bar":
        return renderBarChart()
      case "line":
        return renderLineChart()
      case "pie":
        return renderPieChart()
      default:
        return null
    }
  }

  // Find the active field for drag overlay
  const activeField = fields.find((field) => field.name === activeId)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="mb-8 text-3xl font-bold">Interactive Data Dashboard</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
      >
        <div className="grid gap-6 md:grid-cols-5">
          {/* Left Panel */}
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-md border">
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Chart Type</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    config.chartType === "bar"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleChartTypeChange("bar")}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Bar
                </button>
                <button
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    config.chartType === "line"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleChartTypeChange("line")}
                >
                  <LineChartIcon className="mr-2 h-4 w-4" />
                  Line
                </button>
                <button
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    config.chartType === "pie"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => handleChartTypeChange("pie")}
                >
                  <PieChartIcon className="mr-2 h-4 w-4" />
                  Pie
                </button>
              </div>
            </div>

            <div className="border-t my-4"></div>

            <div className="mb-4">
              <h3 className="text-lg font-medium mb-3">Dimensions</h3>
              <div className="max-h-[150px] overflow-y-auto pr-1">
                {dimensions.map((field) => (
                  <DraggableField key={field.name} id={field.name} label={field.name} type={field.type} />
                ))}
              </div>
            </div>

            <div className="border-t my-4"></div>

            <div>
              <h3 className="text-lg font-medium mb-3">Measures</h3>
              <div className="max-h-[150px] overflow-y-auto pr-1">
                {measures.map((field) => (
                  <DraggableField key={field.name} id={field.name} label={field.name} type={field.type} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="md:col-span-4 bg-white p-4 rounded-lg shadow-md border">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Visualization</h2>
              <div className="flex flex-wrap mt-2 md:mt-0">
                <DropZone id="xAxis" label="X-Axis" value={config.xAxis} acceptType="dimension" />
                <DropZone id="yAxis" label="Y-Axis" value={config.yAxis} acceptType="measure" />
                <DropZone id="dimension" label="Dimension" value={config.dimension} acceptType="dimension" />
                <DropZone id="measure" label="Measure" value={config.measure} acceptType="measure" />
              </div>
            </div>
            <div className="h-[500px] w-full">{renderChart()}</div>
          </div>
        </div>

        <DragOverlay>
          {activeId && activeField && (
            <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
              <span
                className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium mr-2 ${
                  activeField.type === "dimension" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {activeField.type}
              </span>
              <span>{activeField.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

