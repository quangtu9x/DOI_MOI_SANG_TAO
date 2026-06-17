"use client"

import { useCallback, useEffect, useState } from "react"
import {
    History,
} from "lucide-react"
import { Content } from '@/_metronic/layout/components/content';
import { Spin } from "antd"
import './components/styles.css'
import {
    ApiHistoryModal,
    ExampleRequestSection,
    HttpRequestSection,
    OutputDescriptionSection,
    ParameterTable
} from "./components";
import * as actionsGlobal from '@/redux/global/Actions';
import { toast } from "react-toastify";
import { IDataSharing, IPaginationResponse, IResult } from "@/models";
import { requestPOST, requestPUT } from "@/utils/baseAPI";
import { AppDispatch, RootState } from "@/redux/Store";
import { useDispatch, useSelector } from "react-redux";
import { DATA_SHARING_CODE } from "@/data";


export const DuAnCNTTPage = () => {
    const dispatch: AppDispatch = useDispatch();
    const random = useSelector((state: RootState) => state.global.random);
    const [historyOpen, setHistoryOpen] = useState(false)

    const [apiData, setApiData] = useState<IDataSharing | null>()
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await requestPOST<IPaginationResponse<IDataSharing[]>>('DataSharings/search', {
                pageNumber: 1,
                pageSize: 10,
                dataSharingTypeCode: DATA_SHARING_CODE.DU_AN_CNTT
            });

            if (response.data) {
                const { data: responseData } = response.data;
                setApiData(responseData[0] ?? null);
            } else {
                setApiData(null);
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
            toast.error('Không thể tải dữ liệu. Vui lòng thử lại!');
            setApiData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [random]);


    const handleSave = async (field: string, value: any) => {
        try {
            if (!apiData) {
                toast.error('Dữ liệu không hợp lệ, vui lòng thử lại!');
                return;
            }
            const response = await requestPUT<IResult<string>>(`DataSharings/${apiData.id!}`, {
                ...apiData,
                [field]: value,
            })

            if (response?.status == 200) {
                toast.success('Thực hiện thành công!');
                dispatch(actionsGlobal.setRandom());
            } else {
                toast.error(response?.data?.message || 'Thao tác thất bại, vui lòng thử lại!');
            }
        } catch (errorInfo) {
            console.log('Failed:', errorInfo);
        }
    }

    return (
        <Content>
            <div className="card card-xl-stretch">
                <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
                    <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Tích hợp và chia sẻ dữ liệu dự án CNTT'}</h3>
                    <div className="card-toolbar">

                        <button className="btn btn-primary btn-sm py-2 me-2" onClick={() => {
                            if (!Boolean(apiData?.httpRequest?.method?.trim()) || !Boolean(apiData?.httpRequest?.endpoint?.trim())) {
                                toast.warning('Vui lòng nhập thông tin HTTP Request trước khi xem lịch sử!');
                                return;
                            }
                            else
                                setHistoryOpen(true)
                        }}>
                            <span>
                                <History size={16} className="me-2" />
                                <span className="">Lịch sử gọi API</span>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <Spin spinning={isLoading}>
                {!isLoading && (
                    <div className="py-4">
                        <div className="row g-4">
                            <div className="col-12">
                                <HttpRequestSection
                                    value={apiData?.httpRequest ?? null}
                                    onSave={(value) => handleSave('httpRequest', value)}
                                />
                            </div>

                            <div className="col-12">
                                <ExampleRequestSection
                                    value={apiData?.exampleRequest ?? null}
                                    onSave={(value) => handleSave('exampleRequest', value)}
                                />
                            </div>

                            <div className="col-12">
                                <ParameterTable
                                    type="headerParameters"
                                    parameters={apiData?.headerParameters ?? []}
                                    onSave={(value) => handleSave('headerParameters', value)}
                                />
                            </div>

                            <div className="col-12">
                                <ParameterTable
                                    type="urlParameters"
                                    parameters={apiData?.urlParameters ?? []}
                                    onSave={(value) => handleSave('urlParameters', value)}
                                />
                            </div>
                            <div className="col-12">
                                <OutputDescriptionSection
                                    value={apiData?.outputDescription ?? null}
                                    onSave={(value) => handleSave('outputDescription', value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Spin>
            {apiData?.httpRequest &&
                <ApiHistoryModal
                    open={historyOpen}
                    onCancel={() => setHistoryOpen(false)}
                    httpRequest={apiData?.httpRequest ?? null}
                />}
        </Content>
    )
}