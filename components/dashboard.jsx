"use client"

import { useEffect, useState } from "react"
import { BarChart2, LineChart, PieChart } from "lucide-react"
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

import BarChartComponent from "@/components/charts/bar-chart"
import LineChartComponent from "@/components/charts/line-chart"
import PieChartComponent from "@/components/charts/pie-chart"
import DraggableField from "@/components/draggable-field"
import DropZone from "@/components/drop-zone"
import { sampleData } from "@/lib/sample-data"

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
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  })

  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
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

  const renderChart = () => {
    if (!config.dimension || !config.measure) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">Please select dimension and measure to visualize data</p>
        </div>
      )
    }

    switch (config.chartType) {
      case "bar":
        return <BarChartComponent data={data} xAxis={config.xAxis} yAxis={config.yAxis} />
      case "line":
        return <LineChartComponent data={data} xAxis={config.xAxis} yAxis={config.yAxis} />
      case "pie":
        return <PieChartComponent data={data} dimension={config.dimension} measure={config.measure} />
      default:
        return null
    }
  }

  // Find the active field for drag overlay
  const activeField = fields.find((field) => field.name === activeId)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Data Fields</CardTitle>
            <CardDescription>Configure your visualization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-2 font-medium">Chart Type</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={config.chartType === "bar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChartTypeChange("bar")}
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Bar
                </Button>
                <Button
                  variant={config.chartType === "line" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChartTypeChange("line")}
                >
                  <LineChart className="mr-2 h-4 w-4" />
                  Line
                </Button>
                <Button
                  variant={config.chartType === "pie" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChartTypeChange("pie")}
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  Pie
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-medium">Dimensions</h3>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {dimensions.map((field) => (
                    <DraggableField key={field.name} id={field.name} label={field.name} type={field.type} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            <div>
              <h3 className="mb-2 font-medium">Measures</h3>
              <ScrollArea className="h-[120px]">
                <div className="space-y-2">
                  {measures.map((field) => (
                    <DraggableField key={field.name} id={field.name} label={field.name} type={field.type} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Visualization</CardTitle>
              <div className="flex flex-wrap gap-2">
                <DropZone id="xAxis" label="X-Axis" value={config.xAxis} acceptType="dimension" />
                <DropZone id="yAxis" label="Y-Axis" value={config.yAxis} acceptType="measure" />
                <DropZone id="dimension" label="Dimension" value={config.dimension} acceptType="dimension" />
                <DropZone id="measure" label="Measure" value={config.measure} acceptType="measure" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">{renderChart()}</div>
          </CardContent>
        </Card>
      </div>

      <DragOverlay>
        {activeId && activeField && (
          <div className="rounded-md border bg-card px-3 py-2 text-sm shadow-md">
            <Badge variant={activeField.type === "dimension" ? "secondary" : "default"}>{activeField.type}</Badge>
            <span className="ml-2">{activeField.name}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

