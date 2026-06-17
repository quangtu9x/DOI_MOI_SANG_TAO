import { TDEditor } from "@/app/components"
import { Card, Button } from "antd"
import { FileText, Edit3, Save, X } from "lucide-react"
import { useState } from "react"

interface OutputDescriptionSectionProps {
    value: string | null
    onSave: (value: string | null) => void
}

export const OutputDescriptionSection = ({ value, onSave }: OutputDescriptionSectionProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [localValue, setLocalValue] = useState<string | null>(value)

    const handleSave = () => {
        onSave(localValue)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setLocalValue(value)
        setIsEditing(false)
    }

    return (
        <Card
            title={
                <div className="d-flex align-items-center gap-2">
                    <FileText size={16} />
                    Output Description
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
                <div className="space-y-4">
                    <TDEditor data={localValue ?? ''} onChange={setLocalValue} />
                    <div className="d-flex gap-2 mt-3">
                        <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>
                            Lưu
                        </Button>
                        <Button icon={<X size={14} />} onClick={handleCancel}>
                            Hủy
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    className="prose max-w-none"
                    style={{ fontSize: '0.875rem' }}
                    dangerouslySetInnerHTML={{ __html: value ?? '' }}
                />
            )}
        </Card>
    )
}