"use client"

import React, { useCallback, useMemo } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  Handle,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"

// Sample data
const sampleData = [
  {
    id: "1",
    matched: { id: "m1", name: "Product A", value: "10.99" },
    original: { id: "o1", name: "Product Alpha", value: "11.50" },
  },
  {
    id: "2",
    matched: { id: "m2", name: "Product B", value: "24.99" },
    original: { id: "o2", name: "Product Beta", value: "25.00" },
  },
  {
    id: "3",
    matched: { id: "m3", name: "Product C", value: "5.99" },
    original: { id: "o3", name: "Product Charlie", value: "6.25" },
  },
  {
    id: "4",
    matched: { id: "m4", name: "Product D", value: "15.49" },
    original: { id: "o4", name: "Product Delta", value: "15.75" },
  },
  {
    id: "5",
    matched: { id: "m5", name: "Product E", value: "8.99" },
    original: { id: "o5", name: "Product Echo", value: "9.00" },
  },
]

// Table header node component
const TableHeaderNode = ({ data }) => {
  return (
    <div className="w-64 select-none">
      <div className="bg-gray-100 border border-gray-300 rounded-t font-bold text-center py-2">{data.title}</div>
      <div className="flex items-center bg-gray-50 border-x border-b border-gray-300 py-2 font-semibold">
        <div className="flex-1 px-4">{data.columns[0]}</div>
        <div className="px-4 text-right">{data.columns[1]}</div>
        <div className="w-3"></div> {/* Space for handle */}
      </div>
    </div>
  )
}

// Custom node for matched table rows
const MatchedTableRow = ({ data }) => {
  return (
    <div className="flex items-center border-x border-b border-gray-300 bg-white w-64 py-2">
      <div className="flex-1 px-4">
        <div className="font-medium">{data.name}</div>
      </div>
      <div className="px-4 text-right">${data.value}</div>
      <Handle type="source" position={Position.Right} id="right" className="w-3 h-3 bg-blue-500" />
    </div>
  )
}

// Custom node for original table rows
const OriginalTableRow = ({ data }) => {
  return (
    <div className="flex items-center border-x border-b border-gray-300 bg-white w-64 py-2">
      <Handle type="target" position={Position.Left} id="left" className="w-3 h-3 bg-blue-500" />
      <div className="flex-1 px-4">
        <div className="font-medium">{data.name}</div>
      </div>
      <div className="px-4 text-right">${data.value}</div>
    </div>
  )
}

// Main component
const DataMappingFlow = ({ data = sampleData }) => {
  // Define custom node types
  const nodeTypes = useMemo(
    () => ({
      matchedRow: MatchedTableRow,
      originalRow: OriginalTableRow,
      headerNode: TableHeaderNode,
    }),
    [],
  )

  // Create initial nodes
  const initialNodes = useMemo(() => {
    const nodes = []

    // Add table headers as nodes
    nodes.push({
      id: "matched-header",
      type: "headerNode",
      position: { x: 100, y: 20 },
      data: { title: "Matched Data", columns: ["Name", "Value"] },
      draggable: false,
    })

    nodes.push({
      id: "original-header",
      type: "headerNode",
      position: { x: 500, y: 20 },
      data: { title: "Original Data", columns: ["Name", "Value"] },
      draggable: false,
    })

    // Add data nodes
    data.forEach((item, index) => {
      const yPos = 100 + index * 50

      // Matched node (left side)
      nodes.push({
        id: `matched-${item.matched.id}`,
        type: "matchedRow",
        position: { x: 100, y: yPos },
        data: item.matched,
        draggable: false,
      })

      // Original node (right side)
      nodes.push({
        id: `original-${item.original.id}`,
        type: "originalRow",
        position: { x: 500, y: yPos },
        data: item.original,
        draggable: false,
      })
    })

    return nodes
  }, [data])

  // Create initial edges (connections between matched and original nodes)
  const initialEdges = useMemo(() => {
    return data.map((item) => ({
      id: `e-${item.matched.id}-${item.original.id}`,
      source: `matched-${item.matched.id}`,
      target: `original-${item.original.id}`,
      animated: true,
      style: { stroke: "#3b82f6" },
    }))
  }, [data])

  // Set up state for nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle new connections
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#3b82f6" } }, eds))
    },
    [setEdges],
  )

  // Add a bottom border to the last row of each table
  const addBottomBorder = () => {
    const lastMatchedIndex = data.length - 1
    const lastOriginalIndex = data.length - 1

    if (lastMatchedIndex >= 0 && lastOriginalIndex >= 0) {
      const updatedNodes = nodes.map((node) => {
        if (
          node.id === `matched-${data[lastMatchedIndex].matched.id}` ||
          node.id === `original-${data[lastOriginalIndex].original.id}`
        ) {
          return {
            ...node,
            style: {
              ...node.style,
              borderBottom: "1px solid #d1d5db",
              borderBottomLeftRadius: "0.25rem",
              borderBottomRightRadius: "0.25rem",
            },
          }
        }
        return node
      })
      setNodes(updatedNodes)
    }
  }

  // Call once after initial render
  React.useEffect(() => {
    addBottomBorder()
  }, [])

  return (
    <div className="w-full h-[600px] border border-gray-300 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={false}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  )
}

// Wrap with ReactFlowProvider for proper context
export default function Component() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Mapping Interface</h1>
      <p className="mb-4">
        Connect nodes between matched data (left) and original data (right). Click and drag from right handle to left
        handle to create new connections.
      </p>
      <ReactFlowProvider>
        <DataMappingFlow />
      </ReactFlowProvider>
    </div>
  )
}

