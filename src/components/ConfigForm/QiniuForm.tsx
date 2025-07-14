import type { QiniuConfig } from "@/uploader/types"
import { Form, Input, Select } from "antd"

const { Option } = Select
const FormItem = Form.Item

interface QiniuFormProps {
  config?: Partial<QiniuConfig>
}

export function QiniuForm({ config }: QiniuFormProps) {
  return (
    <>
      <FormItem
        label="AccessKey"
        name="accessKeyId"
        rules={[{ required: true, message: "请输入 AccessKey" }]}>
        <Input placeholder="请输入七牛云 AccessKey" />
      </FormItem>

      <FormItem
        name="secretAccessKey"
        rules={[{ required: true, message: "请输入 SecretKey" }]}
        label="SecretKey">
        <Input.Password placeholder="请输入七牛云 SecretKey" />
      </FormItem>

      <FormItem
        name="bucket"
        rules={[{ required: true, message: "请输入空间名称" }]}
        label="存储空间">
        <Input placeholder="请输入七牛云存储空间名称" />
      </FormItem>

      <FormItem
        name="region"
        rules={[{ required: true, message: "请选择存储区域" }]}
        label="存储区域">
        <Select placeholder="请选择七牛云存储区域">
          <Option value="z0">华东-浙江</Option>
          <Option value="z1">华北-河北</Option>
          <Option value="z2">华南-广东</Option>
          <Option value="na0">北美-洛杉矶</Option>
          <Option value="as0">亚太-新加坡</Option>
          <Option value="cn-east-2">华东-浙江2</Option>
        </Select>
      </FormItem>

      <FormItem name="path" label="存储路径">
        <Input placeholder="如：img，可不填，默认为根目录" />
      </FormItem>
    </>
  )
}
