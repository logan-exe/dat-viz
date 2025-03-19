"use client"

import { useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"

export default function DropZone({ id, label, value, acceptType }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  const style = {
    backgroundColor: isOver ? "rgba(var(--primary), 0.1)" : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex min-w-24 items-center rounded-md border border-dashed p-2 text-sm transition-colors"
    >
      <span className="mr-2 text-xs text-muted-foreground">{label}:</span>
      {value ? (
        <Badge variant={acceptType === "dimension" ? "secondary" : "default"}>{value}</Badge>
      ) : (
        <span className="text-xs italic text-muted-foreground">Drop {acceptType}</span>
      )}
    </div>
  )
}

