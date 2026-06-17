import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Form, Input, Spin, Progress, Table } from 'antd';
import { Modal, Button } from 'react-bootstrap';
import { Modal as AntdModal } from 'antd';
import { ActionModalConfig, ActionModalType, IResult } from '@/models';
import { TDUploadFile } from '@/models/TDUploadFile';
import FileUpload from './file-upload';
import { API_URL, requestPOST, requestPUT } from '@/utils/baseAPI';
import { handleFiles } from '@/utils/utils';

interface DuplicateResult {
    tyLeTrungLap: number;
    danhSachTrungLap: {
        tenSangKien: string;
        nguon: string;
        tyLe: number;
    }[];
}


type Props = {
    config: ActionModalConfig;
} & {
    onClose: () => void;
    onSuccess: () => void;
};

export const ActionModal: React.FC<Props> = ({ config, onClose, onSuccess }) => {
    const { visible, title, apiEndpoint, payload, fieldName, fieldLabel, attachmentFieldName, attachmentFieldLabel, type, message } = config;
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);
    const [attachments, setAttachments] = useState<TDUploadFile[]>([]);

    const checkDuplicate = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await requestPOST<IResult<DuplicateResult>>(apiEndpoint, payload);
            if (response?.status === 200 && response?.data?.data) {
                setDuplicateResult(response.data.data);
            } else {
                toast.error(response?.data?.message || 'Kiểm tra thất bại, vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);
            toast.error('Có lỗi xảy ra khi kiểm tra trùng lặp!');
        } finally {
            setIsLoading(false);
        }
    }, [apiEndpoint, payload]);

    useEffect(() => {
        if (type === ActionModalType.CheckDuplicate && visible && !duplicateResult) {
            checkDuplicate();
        }
    }, [checkDuplicate, duplicateResult, type, visible]);

    const handleCancel = () => {
        form.resetFields();
        setAttachments([]);
        setDuplicateResult(null);
        onClose();
    };

    const onFinish = async () => {
        setIsLoading(true);
        try {
            await form.validateFields();

            const values = form.getFieldsValue(true);
            const formData = {
                ...payload,
                ...(fieldName ? { [fieldName]: values[fieldName] } : {}),
                ...(attachmentFieldName ? { [attachmentFieldName]: handleFiles(attachments).join('##') } : {}),
            };

            const payloadId = payload?.id as string | undefined;
            const url = payloadId ? `${apiEndpoint}/${payloadId}` : apiEndpoint;
            const response = await requestPUT<IResult<string>>(url, formData);

            if (response?.status === 200) {
                toast.success('Thao tác thành công!');
                onSuccess();
                handleCancel();
            } else {
                toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
            }
        } catch (errorInfo) {
            console.log('Failed:', errorInfo);
        } finally {
            setIsLoading(false);
        }
    };


    let template = <></>

    switch (type) {
        case ActionModalType.Reject:
            template = (
                <Modal
                    show={visible}
                    fullscreen={'lg-down'}
                    size="lg"
                    onExited={handleCancel}
                    keyboard={true}
                    scrollable={false}
                    onEscapeKeyDown={handleCancel}
                    centered
                >
                    <Modal.Header className="bg-primary px-4 py-3">
                        <Modal.Title className="text-white">{title}</Modal.Title>
                        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
                    </Modal.Header>
                    <Modal.Body className="px-4 py-4">
                        <Spin spinning={isLoading}>
                            <Form form={form} layout="vertical" autoComplete="off">
                                <div className="row">
                                    <div className="col-12">
                                        <Form.Item
                                            label={fieldLabel}
                                            name={fieldName}
                                            rules={[
                                                { required: true, message: 'Không được để trống!' },
                                                { max: 500, message: 'Tối đa 500 ký tự!' }
                                            ]}
                                        >
                                            <Input.TextArea
                                                rows={2}
                                                placeholder=" "
                                                maxLength={500}
                                            />
                                        </Form.Item>
                                    </div>
                                    {attachmentFieldName && (
                                        <div className="col-12">
                                            <Form.Item label={attachmentFieldLabel || 'Đính kèm'} name={attachmentFieldName}>
                                                <FileUpload
                                                    URL={`${API_URL}/api/v1/attachments/public`}
                                                    fileList={attachments}
                                                    onChange={(e: { fileList: TDUploadFile[] }) => setAttachments(e.fileList)}
                                                    multiple={true}
                                                />
                                            </Form.Item>
                                        </div>
                                    )}
                                </div>
                            </Form>
                        </Spin>
                    </Modal.Body>
                    <Modal.Footer className="px-4 py-3 border-0">
                        <div className="d-flex justify-content-center  align-items-center">
                            <Button className="btn-sm btn-primary rounded-1 p-2  ms-2" onClick={onFinish}>
                                <i className="fa-regular fa-floppy-disk"></i>
                                Lưu
                            </Button>
                        </div>
                        <div className="d-flex justify-content-center  align-items-center">
                            <Button className="btn-sm btn-secondary rounded-1 p-2  ms-2" onClick={handleCancel}>
                                <i className="fa-regular fa-xmark"></i>Đóng
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )
            break;
        case ActionModalType.Confirm:
            template = (
                <AntdModal
                    title={title}
                    open={visible}
                    onOk={onFinish}
                    onCancel={onClose}
                    okText={'Đồng ý'}
                    cancelText={'Huỷ'}
                    confirmLoading={isLoading}
                >
                    <div dangerouslySetInnerHTML={{ __html: message || '' }} />
                </AntdModal>
            )
            break;
        case ActionModalType.CheckDuplicate: {
            const duplicateColumns = [
                {
                    title: 'STT',
                    dataIndex: 'index',
                    key: 'index',
                    width: 60,
                    className: 'text-center',
                    render: (_: unknown, __: unknown, index: number) => index + 1,
                },
                {
                    title: 'Tên sáng kiến trùng lặp',
                    dataIndex: 'tenSangKien',
                    key: 'tenSangKien',
                },
                {
                    title: 'Nguồn',
                    dataIndex: 'nguon',
                    key: 'nguon',
                    width: 200,
                },
                {
                    title: 'Tỷ lệ trùng',
                    dataIndex: 'tyLe',
                    key: 'tyLe',
                    width: 120,
                    className: 'text-center',
                    render: (value: number) => (
                        <span className={value >= 70 ? 'text-danger fw-bold' : value >= 40 ? 'text-warning fw-bold' : 'text-success'}>
                            {value}%
                        </span>
                    ),
                },
            ];

            const getProgressStatus = (percent: number): 'success' | 'exception' | 'normal' => {
                if (percent >= 70) return 'exception';
                if (percent >= 40) return 'normal';
                return 'success';
            };

            template = (
                <Modal
                    show={visible}
                    fullscreen={'lg-down'}
                    size="lg"
                    onExited={handleCancel}
                    keyboard={true}
                    scrollable={true}
                    onEscapeKeyDown={handleCancel}
                    centered
                >
                    <Modal.Header className="bg-primary px-4 py-3">
                        <Modal.Title className="text-white">{title}</Modal.Title>
                        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleCancel}></button>
                    </Modal.Header>
                    <Modal.Body className="px-4 py-4">
                        {isLoading ? (
                            <div className="text-center py-5">
                                <Spin size="large" />
                                <div className="mt-3 text-muted">
                                    <i className="fa-regular fa-magnifying-glass me-2"></i>
                                    Đang kiểm tra trùng lặp sáng kiến...
                                </div>
                                <div className="mt-2 text-muted small">
                                    Vui lòng chờ trong giây lát
                                </div>
                            </div>
                        ) : duplicateResult ? (
                            <div>
                                {/* Kết quả tổng quan */}
                                <div className="card bg-light-primary border-0 mb-4">
                                    <div className="card-body py-4">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <h5 className="mb-1">Kết quả kiểm tra</h5>
                                                <p className="text-muted mb-0">
                                                    {duplicateResult.tyLeTrungLap >= 70
                                                        ? 'Phát hiện trùng lặp cao - Cần xem xét lại nội dung sáng kiến'
                                                        : duplicateResult.tyLeTrungLap >= 40
                                                            ? 'Có một số nội dung tương đồng - Nên kiểm tra kỹ'
                                                            : 'Nội dung sáng kiến đạt yêu cầu về tính mới'}
                                                </p>
                                            </div>
                                            <div className="text-center" style={{ minWidth: 120 }}>
                                                <Progress
                                                    type="circle"
                                                    percent={duplicateResult.tyLeTrungLap}
                                                    size={80}
                                                    status={getProgressStatus(duplicateResult.tyLeTrungLap)}
                                                    format={(percent) => (
                                                        <span className="fw-bold">{percent}%</span>
                                                    )}
                                                />
                                                <div className="mt-1 small text-muted">Tỷ lệ trùng lặp</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Danh sách sáng kiến trùng lặp */}
                                {duplicateResult.danhSachTrungLap && duplicateResult.danhSachTrungLap.length > 0 ? (
                                    <div>
                                        <h6 className="mb-3">
                                            <i className="fa-regular fa-list me-2"></i>
                                            Danh sách sáng kiến tương đồng ({duplicateResult.danhSachTrungLap.length})
                                        </h6>
                                        <Table
                                            dataSource={duplicateResult.danhSachTrungLap}
                                            columns={duplicateColumns}
                                            rowKey={(record, index) => `${record.tenSangKien}-${index}`}
                                            pagination={false}
                                            size="small"
                                            bordered
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-3 text-success">
                                        <i className="fa-regular fa-circle-check fa-2x mb-2"></i>
                                        <div>Không phát hiện sáng kiến trùng lặp</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                <i className="fa-regular fa-circle-exclamation fa-2x mb-2"></i>
                                <div>Không có dữ liệu</div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="px-4 py-3 border-0">
                        {!isLoading && duplicateResult && (
                            <div className="d-flex justify-content-center align-items-center">
                                <Button
                                    className="btn-sm btn-light-primary rounded-1 p-2 ms-2"
                                    onClick={() => {
                                        setDuplicateResult(null);
                                        checkDuplicate();
                                    }}
                                >
                                    <i className="fa-regular fa-rotate me-1"></i>
                                    Kiểm tra lại
                                </Button>
                            </div>
                        )}
                        <div className="d-flex justify-content-center align-items-center">
                            <Button className="btn-sm btn-secondary rounded-1 p-2 ms-2" onClick={handleCancel}>
                                <i className="fa-regular fa-xmark"></i>Đóng
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>
            )
            break;
        }
    }

    return template;
};

