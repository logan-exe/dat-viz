"use client"

import { useDraggable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"

export default function DraggableField({ id, label, type }) {
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
      className="flex items-center justify-between rounded-md border bg-card p-2 text-sm"
    >
      <div className="flex items-center">
        <Badge variant={type === "dimension" ? "secondary" : "default"} className="mr-2">
          {type.charAt(0).toUpperCase()}
        </Badge>
        <span>{label}</span>
      </div>
    </div>
  )
}

