import { Card, Button } from "antd"
import TextArea from "antd/es/input/TextArea"
import {
    Save,
    Edit3,
    Code,
    X,
    Copy,
    Check,
} from "lucide-react"
import { useState } from "react"
import { message } from "antd"

interface ExampleRequestSectionProps {
    value: string | null
    onSave: (value: string | null) => void
}

export const ExampleRequestSection = ({ value, onSave }: ExampleRequestSectionProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [localData, setLocalData] = useState<string | null>(value)
    const [copied, setCopied] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const handleSave = () => {
        onSave(localData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setLocalData(value)
        setIsEditing(false)
    }

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            messageApi.success({
                content: "Nội dung đã được copy vào clipboard.",
                duration: 2,
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            messageApi.error({
                content: "Không thể copy nội dung. Vui lòng thử lại.",
                duration: 2,
            })
        }
    }

    return (
        <Card
            title={
                <div className="d-flex align-items-center gap-2">
                    <Code size={16} />
                    Example Request
                </div>
            }
            extra={
                !isEditing && (
                    <Button
                        type="text"
                        icon={<Edit3 size={14} />}
                        onClick={() => setIsEditing(true)}
                    />
                )
            }
        >
            {contextHolder}
            {isEditing ? (
                <div className="row g-3">
                    <div className="col-12">
                        <label>Code Example</label>
                        <TextArea
                            value={localData ?? ''}
                            onChange={(e) => setLocalData(e.target.value)}
                            style={{ height: 300 }}
                            className="font-monospace"
                        />
                    </div>
                    <div className="col-12 d-flex gap-2">
                        <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>
                            Lưu
                        </Button>
                        <Button icon={<X size={14} />} onClick={handleCancel}>
                            Hủy
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="prose position-relative">
                    <pre className="p-3 rounded">
                        <code className="example-code">{value}</code>
                    </pre>
                    <Button
                        style={{ backgroundColor: '#31353f', color: '#9ca3af' }}
                        className="position-absolute top-0 end-0 mt-2 me-2"
                        type="text"
                        icon={copied ? <Check size={14} /> : <Copy size={14} />}
                        onClick={() => handleCopy(localData ?? '')}
                    />
                </div>
            )}
        </Card>
    )
}