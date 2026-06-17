import { ISharingHttpRequest } from "@/models"
import { Card, Button, Input, Tag } from "antd"
import { Globe, Edit3, Save, X } from "lucide-react"
import { useState } from "react"

interface HttpRequestSectionProps {
    value: ISharingHttpRequest | null
    onSave: (value: ISharingHttpRequest | null) => void
}

export const HttpRequestSection = ({ value, onSave }: HttpRequestSectionProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [localData, setLocalData] = useState<ISharingHttpRequest | null>(value)

    const handleSave = () => {
        onSave(localData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setLocalData(value)
        setIsEditing(false)
    }

    return (
        <Card
            title={
                <div className="d-flex align-items-center gap-2">
                    <Globe size={16} />
                    HTTP Request
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
            {isEditing ? (
                <div className="row g-3">
                    <div className="col-md-6">
                        <label>Method</label>
                        <Input
                            value={localData?.method ?? ''}
                            onChange={(e) => setLocalData(prev => ({ ...prev, method: e.target.value }))}
                        />
                    </div>
                    <div className="col-md-6">
                        <label>Endpoint</label>
                        <Input
                            value={localData?.endpoint ?? ''}
                            onChange={(e) => setLocalData(prev => ({ ...prev, endpoint: e.target.value }))}
                        />
                    </div>
                    <div className="col-12">
                        <label>Description</label>
                        <Input
                            value={localData?.description ?? ''}
                            onChange={(e) => setLocalData(prev => ({ ...prev, description: e.target.value }))}
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
                <div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <Tag className="font-monospace">{value?.method}</Tag>
                        <code className="bg-gray-200 px-2 rounded">{value?.endpoint}</code>
                    </div>
                    <p className="text-muted mb-0">{value?.description}</p>
                </div>
            )}
        </Card>
    )
}