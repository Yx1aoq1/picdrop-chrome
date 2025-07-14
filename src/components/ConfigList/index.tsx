import { PlusOutlined } from "@ant-design/icons"
import { Button, List, Space, Typography } from "antd"
import { useState } from "react"

import { DraggableConfigItem, type ConfigItem } from "./DraggableConfigItem"

const { Title } = Typography

export interface ConfigListProps {
  title: string
  configs: ConfigItem[]
  selectedIdx: number
  onAddNew: () => void
  onSelectConfig: (idx: number) => void
  onDeleteConfig: (idx: number, e: React.MouseEvent) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function ConfigList({
  title,
  configs,
  selectedIdx,
  onAddNew,
  onSelectConfig,
  onDeleteConfig,
  onReorder
}: ConfigListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex && onReorder) {
      onReorder(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
  }

  return (
    <>
      <div style={{ padding: "20px 16px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={4}>{title}</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddNew}
            style={{ width: "100%" }}>
            新增配置
          </Button>
        </Space>
      </div>

      <List
        dataSource={configs}
        renderItem={(config, idx) => (
          <DraggableConfigItem
            key={`${config.name}-${idx}`}
            config={config}
            index={idx}
            isSelected={selectedIdx === idx}
            onSelect={() => onSelectConfig(idx)}
            onDelete={(e) => onDeleteConfig(idx, e)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        )}
      />
    </>
  )
}
