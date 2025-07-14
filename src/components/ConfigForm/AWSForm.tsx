import type { S3Config } from "@/uploader/types"
import { Form, Input } from "antd"

const FormItem = Form.Item

interface AWSFormProps {
  config?: Partial<S3Config>
}

export function AWSForm({ config }: AWSFormProps) {
  return (
    <>
      <FormItem
        label="AccessKey ID"
        name="accessKeyId"
        rules={[{ required: true, message: "请输入 AccessKey ID" }]}>
        <Input placeholder="请输入 AccessKey ID" />
      </FormItem>

      <FormItem
        name="secretAccessKey"
        rules={[{ required: true, message: "请输入 Secret Access Key" }]}
        label="Secret Access Key">
        <Input.Password placeholder="请输入 Secret Access Key" />
      </FormItem>

      <FormItem
        name="bucket"
        rules={[{ required: true, message: "请输入 Bucket 名称" }]}
        label="Bucket">
        <Input placeholder="请输入 Bucket 名称" />
      </FormItem>

      <FormItem
        name="region"
        rules={[{ required: true, message: "请选择区域" }]}
        label="Region">
        <Input placeholder="请输入 Region 名称" />
      </FormItem>

      <FormItem
        name="endpoint"
        rules={[{ required: true, message: "请输入 Endpoint" }]}
        label="Endpoint">
        <Input placeholder="如：https://s3.amazonaws.com" />
      </FormItem>

      <FormItem name="path" label="存储路径">
        <Input placeholder="如：images，可不填，默认为根目录" />
      </FormItem>
    </>
  )
}
