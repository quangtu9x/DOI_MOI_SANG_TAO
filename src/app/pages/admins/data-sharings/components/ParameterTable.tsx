import { ISharingParameter } from "@/models"
import { Card, Button, Table, Input, Tag, Checkbox } from "antd"
import { Settings, Globe, Plus, Edit3, Save, X, Trash2 } from "lucide-react"
import { useState } from "react"


interface ParameterTableProps {
    parameters: ISharingParameter[] | null
    type: "headerParameters" | "urlParameters"
    onSave: (value: ISharingParameter[] | null) => void
}

export const ParameterTable = ({ parameters, type, onSave }: ParameterTableProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const [localParams, setLocalParams] = useState<ISharingParameter[] | null>([...parameters ?? []])

    const handleAdd = () => {
        setLocalParams([...localParams ?? [], {
            name: "",
            type: "string",
            required: false,
            description: ""
        }])
    }

    const handleUpdate = (index: number, field: keyof ISharingParameter, value: any) => {
        const updatedParams = localParams?.map((param, i) =>
            i === index ? { ...param, [field]: value } : param
        )
        console.log("Updated parameters:", updatedParams)
        setLocalParams(updatedParams ?? [])
    }

    const handleRemove = (index: number) => {
        const updatedParams = localParams?.filter((_, i) => i !== index)
        setLocalParams(updatedParams ?? [])
    }

    const handleSave = () => {
        console.log("Saving parameters:", localParams)
        onSave(localParams)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setLocalParams([...parameters ?? []])
        setIsEditing(false)
    }

    return (
        <Card
            title={
                <div className="d-flex align-items-center gap-2">
                    {type === 'headerParameters' ? <Settings size={16} /> : <Globe size={16} />}
                    {type === 'headerParameters' ? 'Header Parameters' : 'URL Parameters'}
                </div>
            }
            extra={
                <div className="d-flex gap-2">
                    {!isEditing && (
                        <>
                            <Button type="text" icon={<Plus size={14} />} onClick={handleAdd} />
                            <Button type="text" icon={<Edit3 size={14} />} onClick={() => setIsEditing(true)} />
                        </>
                    )}
                </div>
            }
        >
            <Table dataSource={localParams ?? []} pagination={false} bordered size="small">
                <Table.Column
                    title="Name"
                    dataIndex="name"
                    render={(text, _, index) => isEditing ? (
                        <Input
                            value={text}
                            onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                        />
                    ) : (
                        <code>{text}</code>
                    )}
                />
                <Table.Column
                    title="Type"
                    dataIndex="type"
                    className="text-center"
                    render={(text, _, index) => isEditing ? (
                        <Input
                            value={text}
                            onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                        />
                    ) : (
                        <Tag>{text}</Tag>
                    )}
                />
                <Table.Column
                    title="Required"
                    dataIndex="required"
                    key="required"
                    className="text-center"
                    render={(checked, _, index) => isEditing ? (
                        <Checkbox
                            checked={checked}
                            onChange={(e) => handleUpdate(index, "required", e.target.checked)}
                        />
                    ) : (
                        <Tag color={checked ? "error" : "default"}>
                            {checked ? "Required" : "Optional"}
                        </Tag>
                    )}
                />
                <Table.Column
                    title="Description"
                    dataIndex="description"
                    key="description"
                    render={(text, _, index) => isEditing ? (
                        <Input
                            value={text}
                            onChange={(e) => handleUpdate(index, "description", e.target.value)}
                        />
                    ) : text}
                />
                {isEditing && (
                    <Table.Column
                        title="Action"
                        render={(_, __, index) => (
                            <Button
                                danger
                                icon={<Trash2 size={14} />}
                                onClick={() => handleRemove(index)}
                            />
                        )}
                    />
                )}
            </Table>
            {isEditing && (
                <div className="d-flex gap-2 mt-3">
                    <Button type="primary" icon={<Save size={14} />} onClick={handleSave}>
                        Lưu
                    </Button>
                    <Button icon={<X size={14} />} onClick={handleCancel}>
                        Hủy
                    </Button>
                </div>
            )}
        </Card>
    )
}