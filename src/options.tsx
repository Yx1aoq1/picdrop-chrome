import { Card, Layout, message, Typography } from "antd"
import { useEffect, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { ConfigForm, ConfigList } from "./components"
import type { UploadConfig } from "./uploader"

const { Sider, Content } = Layout

function OptionsIndex() {
  const [configs, setConfigs] = useStorage<UploadConfig[]>("picdropConfigs", [])
  const [selectedIdx, setSelectedIdx] = useState<number>(-1)
  const [isCreating, setIsCreating] = useState(false)

  const selectedConfig = selectedIdx > -1 ? configs[selectedIdx] : null

  const handleAddNew = () => {
    setIsCreating(true)
    setSelectedIdx(-1)
  }

  const handleSaveConfig = (values: UploadConfig) => {
    if (isCreating) {
      // 新增配置
      const newConfig: UploadConfig = values
      setConfigs([...configs, newConfig])
      setSelectedIdx(configs.length)
      setIsCreating(false)
    } else if (selectedConfig) {
      // 更新配置
      const updatedConfigs = configs.map((config, idx) =>
        idx === selectedIdx ? { ...config, ...values } : config
      )
      setConfigs(updatedConfigs)
    }
  }

  const handleSelectConfig = (idx: number) => {
    setSelectedIdx(idx)
    setIsCreating(false)
  }

  const handleDeleteConfig = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation() // 阻止触发选中事件

    const newConfigs = configs.filter((_, index) => index !== idx)
    setConfigs(newConfigs)

    // 调整选中索引
    if (selectedIdx === idx) {
      // 如果删除的是当前选中的配置
      setSelectedIdx(-1)
      setIsCreating(false)
    } else if (selectedIdx > idx) {
      // 如果删除的配置在当前选中配置之前，需要调整索引
      setSelectedIdx(selectedIdx - 1)
    }

    message.success("配置删除成功！")
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    // 创建新的配置数组进行重排序
    const newConfigs = [...configs]
    const [draggedItem] = newConfigs.splice(fromIndex, 1)
    newConfigs.splice(toIndex, 0, draggedItem)

    // 更新配置数组
    setConfigs(newConfigs)

    // 更新选中索引
    if (selectedIdx === fromIndex) {
      // 如果拖拽的是当前选中项，更新选中索引到新位置
      setSelectedIdx(toIndex)
    } else if (selectedIdx > fromIndex && selectedIdx <= toIndex) {
      // 如果选中项在拖拽范围内且位于拖拽项之后，索引减1
      setSelectedIdx(selectedIdx - 1)
    } else if (selectedIdx < fromIndex && selectedIdx >= toIndex) {
      // 如果选中项在拖拽范围内且位于拖拽项之前，索引加1
      setSelectedIdx(selectedIdx + 1)
    }

    message.success("配置顺序已更新！")
  }

  // 如果没有配置且不在创建状态，默认显示创建状态
  useEffect(() => {
    if (configs.length === 0 && !isCreating) {
      setIsCreating(true)
    }
  }, [configs.length, isCreating])

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", height: "100vh" }}>
      <Layout style={{ height: "100%" }}>
        <Sider
          width={300}
          style={{ background: "#fff", borderRight: "1px solid #f0f0f0" }}>
          <ConfigList
            title="配置"
            configs={configs}
            selectedIdx={selectedIdx}
            onAddNew={handleAddNew}
            onSelectConfig={handleSelectConfig}
            onDeleteConfig={handleDeleteConfig}
            onReorder={handleReorder}
          />
        </Sider>

        <Content style={{ padding: "20px" }}>
          <Card
            title={
              isCreating
                ? "新增配置"
                : selectedConfig
                  ? `编辑配置：${selectedConfig.name}`
                  : "请选择配置"
            }
            style={{ height: "100%" }}>
            {isCreating || selectedConfig ? (
              <ConfigForm
                config={isCreating ? undefined : selectedConfig}
                onSave={handleSaveConfig}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Typography.Text type="secondary">
                  请从左侧列表选择一个配置进行编辑，或点击"新增配置"创建新的配置
                </Typography.Text>
              </div>
            )}
          </Card>
        </Content>
      </Layout>
    </div>
  )
}

export default OptionsIndex
