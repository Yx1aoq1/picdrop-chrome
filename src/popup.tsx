import { FileOutlined, InboxOutlined } from "@ant-design/icons"
import type { UploadProps } from "antd"
import { Alert, Button, Checkbox, Input, message, Tabs, Upload } from "antd"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { createUploader, type UploadConfig } from "./uploader"

const { Dragger } = Upload

function IndexPopup() {
  const [data, setData] = useState("")
  const [md, setMd] = useStorage("copyMd")
  const [fileName, setFileName] = useStorage("fileName")
  const [imgList, setimgList] = useStorage("fileList", [])
  const [configs, setConfigs] = useStorage<UploadConfig[]>("picdropConfigs", [])

  const props: UploadProps = {
    name: "file",
    multiple: true,
    async customRequest({ file, data, onProgress, onSuccess, onError }) {
      const uploader = createUploader({
        config: configs[0],
        onProgress: (progress) => {
          onProgress({
            percent: Math.round((progress.loaded / progress.total) * 100)
          })
        },
        onSuccess: (result) => {
          onSuccess(result)
        },
        onError: (error) => {
          onError(error)
        }
      })

      const taskId = uploader.upload(file as File)
      uploader.cancel(taskId)
    }
  }

  return (
    <div
      style={{
        width: 350,
        padding: "0 8px 8px"
      }}>
      <Tabs animated={false} defaultActiveKey="1" type="line">
        <Tabs.TabPane tab="上传" key="1">
          {configs.length > 0 ? (
            <div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "12px",
                  textAlign: "center"
                }}>
                上传配置有问题？
                <a
                  target="_blank"
                  href="/options.html"
                  style={{
                    color: "#999",
                    textDecoration: "underline",
                    marginLeft: "4px"
                  }}>
                  去修改
                </a>
              </div>
              <div className="input-wapper">
                <Input placeholder="^/⌘ + v 剪贴板上传" />
                <Checkbox onChange={(e) => setMd(e.target.checked)}>
                  markdown
                </Checkbox>
              </div>

              <Dragger className="mb-2" {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此处</p>
                <p className="ant-upload-hint">支持多文件上传</p>
              </Dragger>
            </div>
          ) : (
            <div className="mb-2">
              <Alert
                showIcon
                message="请先填写配置"
                description={
                  <a target="_blank" href="/options.html">
                    去设置
                  </a>
                }
                type="success"
              />
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          style={{ height: 250, overflow: "auto" }}
          tab="历史记录"
          key="2"></Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default IndexPopup
