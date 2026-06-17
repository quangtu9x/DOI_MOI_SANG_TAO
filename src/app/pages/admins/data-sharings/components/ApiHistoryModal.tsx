import { TDTable } from "@/app/components"
import { IDataSharingLog, IPaginationResponse, ISharingHttpRequest } from "@/models"
import { requestPOST } from "@/utils/baseAPI"
import { Modal, Table, TableProps, Tag } from "antd"
import dayjs from "dayjs"
import { History } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"


interface ApiHistoryModalProps {
    open: boolean
    onCancel: () => void
    httpRequest: ISharingHttpRequest
}

export const ApiHistoryModal = ({ open, onCancel, httpRequest }: ApiHistoryModalProps) => {
    const [data, setData] = useState<IDataSharingLog[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const getStatusCodeColor = (statusCode: number): "info" | "success" | "redirect" | "warning" | "error" => {
        if (statusCode >= 100 && statusCode < 200) return "info"      // 1xx: Informational
        if (statusCode >= 200 && statusCode < 300) return "success"   // 2xx: Success
        if (statusCode >= 300 && statusCode < 400) return "redirect"  // 3xx: Redirect
        if (statusCode >= 400 && statusCode < 500) return "warning"   // 4xx: Client errors
        if (statusCode >= 500 && statusCode < 600) return "error"     // 5xx: Server errors
        return "error"                                                 // ngoài 1–599 coi là error
    }

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await requestPOST<IPaginationResponse<IDataSharingLog[]>>('api/v1/DataSharingLogs/search', {
                pageNumber: currentPage,
                pageSize: pageSize,
                method: httpRequest?.method,
                endpoint: httpRequest?.endpoint,
            });

            if (response.data) {
                const { data: responseData, totalCount: total } = response.data;
                setData(responseData ?? []);
                setTotalCount(total);
            } else {
                setData([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
            toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
            setData([]);
            setTotalCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open, fetchData]);

    const columns: TableProps<IDataSharingLog>['columns'] = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 50,
            render: (text, record, index) => <div>{(currentPage - 1) * pageSize + index + 1}</div>,
        },
        {
            title: 'Thời gian',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text: string) => <span className="font-monospace">{text ? dayjs(text).format('DD/MM/YYYY hh:MM:ss') : ''}</span>
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            className: 'text-center',
            render: (text: string) => <Tag>{text}</Tag>
        },
        {
            title: 'Endpoint',
            dataIndex: 'endpoint',
            key: 'endpoint',
            render: (text: string) => <span className="font-monospace">{text}</span>
        },
        {
            title: 'Status Code',
            dataIndex: 'statusCode',
            key: 'statusCode',
            className: 'text-center',
            render: (statusCode: number) => (
                <Tag color={getStatusCodeColor(statusCode)}>{statusCode}</Tag>
            )
        },
        {
            title: 'Response Time',
            dataIndex: 'responseTime',
            key: 'responseTime',
            className: 'text-center',
        }
    ];

    return (
        <Modal
            loading={isLoading}
            title={
                <div className="d-flex align-items-center gap-2">
                    <History size={18} />
                    Lịch sử gọi API
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={null}
            width="90%"
        >
            <TDTable<IDataSharingLog>
                dataSource={data}
                columns={columns}
                isPagination={true}
                pageSize={pageSize}
                count={totalCount}
                offset={currentPage}
                setOffset={setCurrentPage}
                setPageSize={setPageSize}
                loading={isLoading}
            />
        </Modal>
    )
}
