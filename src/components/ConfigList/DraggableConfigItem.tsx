import { UploadTypeOptions } from "@/uploader"
import { DeleteOutlined, SettingOutlined } from "@ant-design/icons"
import { Button, List, Popconfirm } from "antd"
import { useState } from "react"

export interface ConfigItem {
  name: string
  type?: string
  [key: string]: any
}

export interface DraggableConfigItemProps {
  config: ConfigItem
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
  onDragStart: (index: number) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (targetIndex: number) => void
}

export function DraggableConfigItem({
  config,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: DraggableConfigItemProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", index.toString())
    onDragStart(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setIsDragOver(true)
    onDragOver(e)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // 只有当鼠标离开当前元素边界时才设置为false
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(index)
  }

  const handleDragEnd = () => {
    setIsDragOver(false)
    onDragEnd()
  }

  const itemStyle = {
    padding: "12px 16px",
    cursor: "pointer",
    backgroundColor: isSelected ? "#f6ffed" : "transparent",
    borderLeft: isSelected ? "3px solid #52c41a" : "3px solid transparent",
    borderTop: isDragOver ? "2px solid #1890ff" : "2px solid transparent",
    transition: "all 0.2s ease"
  }

  return (
    <List.Item
      draggable
      style={itemStyle}
      onClick={onSelect}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      <List.Item.Meta
        avatar={<SettingOutlined />}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
            <span>{config.name}</span>
            <Popconfirm
              title="确认删除"
              description="确定要删除这个配置吗？"
              onConfirm={onDelete}
              onCancel={(e) => e?.stopPropagation()}
              okText="确认"
              cancelText="取消">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
                style={{
                  opacity: 0.6,
                  transition: "opacity 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "1"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "0.6"
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </div>
        }
        description={
          UploadTypeOptions.find((option) => option.value === config.type)
            ?.label
        }
      />
    </List.Item>
  )
}
