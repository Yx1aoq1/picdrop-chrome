import type { UploadConfig, UploadType } from "@/uploader"
import { UploadTypeConstant, UploadTypeOptions } from "@/uploader/constants"
import { Button, Form, Input, message, Select } from "antd"
import { useEffect, useState } from "react"

import { AWSForm } from "./AWSForm"
import { QiniuForm } from "./QiniuForm"

const Option = Select.Option
const FormItem = Form.Item

export function ConfigForm({
  config,
  onSave
}: {
  config?: UploadConfig
  onSave: (values: any) => void
}) {
  const [form] = Form.useForm()
  const [configType, setConfigType] = useState<UploadType>(
    UploadTypeOptions[0].value
  )

  const onFinish = (values: UploadConfig) => {
    // 组合最终的配置数据
    onSave({
      ...values,
      type: configType
    })
    message.success("保存成功！")
  }

  useEffect(() => {
    if (config) {
      // 如果有配置数据，设置表单值和配置类型
      form.setFieldsValue(config)
      setConfigType(config.type)
    } else {
      form.resetFields()
      // 设置默认的type值到表单
      const defaultType = UploadTypeOptions[0].value
      form.setFieldsValue({ type: defaultType })
      setConfigType(defaultType)
    }
  }, [config, form])

  const handleTypeChange = (value: "aws" | "qiniu") => {
    // 切换类型时，清除除名称外的其他字段
    const currentName = form.getFieldValue("name")
    form.resetFields()
    form.setFieldsValue({
      name: currentName,
      type: value
    })
    setConfigType(value)
  }

  return (
    <Form
      layout="vertical"
      form={form}
      initialValues={{ type: "qiniu", ...config }}
      onFinish={onFinish}
      autoComplete="off">
      {/* 共同配置：名称 */}
      <FormItem
        label="配置名称"
        name="name"
        rules={[{ required: true, message: "请输入配置名称" }]}>
        <Input placeholder="请输入配置名称" />
      </FormItem>

      {/* 配置类型选择 */}
      <FormItem
        label="存储类型"
        name="type"
        rules={[{ required: true, message: "请选择存储类型" }]}>
        <Select onChange={handleTypeChange} placeholder="请选择存储类型">
          {UploadTypeOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </FormItem>

      {/* 根据配置类型动态渲染对应的表单 */}
      {configType === UploadTypeConstant.AWS && <AWSForm config={config} />}
      {configType === UploadTypeConstant.QINIU && <QiniuForm config={config} />}

      <FormItem>
        <Button type="primary" size="large" htmlType="submit">
          保存配置
        </Button>
      </FormItem>
    </Form>
  )
}
