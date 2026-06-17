import React, { useMemo, useState, useEffect } from 'react';
import { TDHotTable } from '@/app/components';
import { numericRenderer } from 'handsontable/renderers';
import { LoaiNhapLieuChiPhi, LoaiBangChiPhi } from '@/models';
import { requestPOST } from '@/utils/baseAPI';
import { Modal, Button } from 'react-bootstrap';
import { Form, InputNumber } from 'antd';

interface Props {
    hotRef: any;
    tableData: any[];
    setTableData: (data: any[]) => void;
    onBack: () => void;
    onSubmit: () => void;
    phanLoai?: string | number;
}

export const Step2DuToan: React.FC<Props> = ({ phanLoai, hotRef, tableData, setTableData, onBack, onSubmit }) => {
    const isReadOnly = false;
    const [showLegendModal, setShowLegendModal] = useState<boolean>(false);

    const [showDinhMucModal, setShowDinhMucModal] = useState<boolean>(false);
    const [dinhMucRowIndex, setDinhMucRowIndex] = useState<number | null>(null);
    const [dinhMucValue, setDinhMucValue] = useState<number>(0);

    const handleAddRowBelow = (rowIndex: number) => {
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) return;

        const currentData = [...hotInstance.getSourceData()];
        const parentRow = currentData[rowIndex];

        const parentId = parentRow.id || null;
        const parentStt = parentRow.stt || '';

        let maxChildIndex = 0;
        let insertIndex = rowIndex + 1;
        const parentSttPartsLength = parentStt ? parentStt.split('.').length : 0;

        for (let i = rowIndex + 1; i < currentData.length; i++) {
            const childRow = currentData[i];
            if (childRow.stt && childRow.stt.startsWith(`${parentStt}.`)) {
                insertIndex = i + 1;

                const childSttParts = childRow.stt.split('.');
                if (childSttParts.length === parentSttPartsLength + 1) {
                    const lastNum = parseInt(childSttParts[childSttParts.length - 1], 10);
                    if (!isNaN(lastNum) && lastNum > maxChildIndex) {
                        maxChildIndex = lastNum;
                    }
                }
            } else {
                break;
            }
        }

        const nextStt = parentStt ? `${parentStt}.${maxChildIndex + 1}` : '';

        const newRow = {
            id: crypto.randomUUID(),
            isCustom: true,
            stt: nextStt,
            ten: 'Phần mềm...',
            kyHieu: '',
            chiPhiTruocThue: 0,
            chiPhiThueVAT: 0,
            chiPhiSauThue: 0,
            canCu: '',
            loaiNhapLieu: LoaiNhapLieuChiPhi.NguoiDungNhapLieu,
            danhMucChaId: parentId,
            isSubHeader: nextStt && String(nextStt).split('.').length < 2,
        };

        currentData.splice(insertIndex, 0, newRow);
        setTableData(currentData);
    };

    const calculateData = async (changes: any[] | null) => {
        if (!changes) return;
        const hotInstance = hotRef.current?.hotInstance;
        if (!hotInstance) return;

        const currentData = hotInstance.getSourceData();
        try {
            const response = await requestPOST<any[]>(`kehoachs/calculate`, {
                phanLoai: phanLoai,
                danhMucChiPhis: currentData.map(item => ({
                    ...item,
                    chiPhiTruocThue: Number(item.chiPhiTruocThue) || 0,
                }))
            });
            if (response?.data) {
                const processedData = response.data.map((item: any) => {
                    const originalItem = currentData.find(x => x.id === item.id);
                    return {
                        ...item,
                        isCustom: originalItem?.isCustom || false,
                        isSubHeader: item.stt && String(item.stt).split('.').length < 2,
                    };
                });
                setTableData(processedData);
            }
        } catch (error) {
            console.error('Error calculating:', error);
        }
    };

    const columns = useMemo(() => [
        {
            data: 'stt',
            title: 'STT',
            readOnly: false,
            width: 50,
            className: 'htCenter htMiddle',
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                cellProperties.readOnly = true;
                if (rowData.stt === 'II.2.1') {
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                } else {
                    td.style.background = '#f7f7f9';
                }
                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }

                td.innerText = value || '';
                td.className = 'htCenter htMiddle';
                return td;
            }
        },
        {
            data: 'ten',
            title: 'Tên chi phí',
            readOnly: false,
            width: 250,
            className: 'htMiddle',
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                if (isReadOnly) {
                    cellProperties.readOnly = true;
                } else if (rowData.stt === 'II.2.1') {
                    cellProperties.readOnly = true;
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt?.includes('II.2.1.')) {
                    td.style.background = '#fff';
                    cellProperties.readOnly = false;
                } else {
                    cellProperties.readOnly = true;
                }

                if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                }

                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
                td.innerText = value || '';
                return td;
            }
        },
        {
            data: 'kyHieu',
            title: 'Ký hiệu',
            readOnly: true,
            width: 100,
            className: 'htCenter htMiddle',
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                if (rowData.stt === 'II.2.1') {
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                } else {
                    td.style.background = '';
                }
                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
                td.innerText = value || '';
                td.className = 'htCenter htMiddle';
                return td;
            }
        },
        {
            data: 'chiPhiTruocThue',
            title: 'Chi phí trước thuế',
            type: 'numeric',
            numericFormat: { pattern: '0,0', culture: 'en-US' },
            width: 150,
            className: 'htRight htMiddle',
            readOnly: false,
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                numericRenderer(instance, td, row, col, prop, value, cellProperties);
                if (isReadOnly) {
                    cellProperties.readOnly = true;
                } else if (rowData.stt === 'II.2.1') {
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                    cellProperties.readOnly = true;
                } else if (rowData.loaiNhapLieu !== LoaiNhapLieuChiPhi.NguoiDungNhapLieu) {
                    cellProperties.readOnly = true;
                    td.style.background = '#f0f0f0';
                } else {
                    cellProperties.readOnly = false;
                    td.style.background = '#fff';
                }

                if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                }

                if (rowData.khongThemVaoTong) {
                    td.style.textDecoration = 'line-through';
                } else {
                    td.style.textDecoration = 'none';
                }

                if (value && value !== 0 && rowData.cachTinhGiaTri) {
                    td.setAttribute('title', rowData.cachTinhGiaTri);
                } else {
                    td.removeAttribute('title');
                }

                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
            }
        },
        {
            data: 'chiPhiThueVAT',
            title: 'Thuế VAT',
            type: 'numeric',
            numericFormat: { pattern: '0,0', culture: 'en-US' },
            width: 120,
            className: 'htRight htMiddle',
            readOnly: true,
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                numericRenderer(instance, td, row, col, prop, value, cellProperties);
                if (rowData.stt === 'II.2.1') {
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                } else {
                    td.style.background = '';
                }

                if (rowData.khongThemVaoTong) {
                    td.style.textDecoration = 'line-through';
                } else {
                    td.style.textDecoration = 'none';
                }

                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
            }
        },
        {
            data: 'chiPhiSauThue',
            title: 'Chi phí sau thuế',
            type: 'numeric',
            numericFormat: { pattern: '0,0', culture: 'en-US' },
            width: 150,
            className: 'htRight htMiddle',
            readOnly: true,
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                numericRenderer(instance, td, row, col, prop, value, cellProperties);
                if (rowData.stt === 'II.2.1') {
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                } else {
                    td.style.background = '';
                }

                if (rowData.khongThemVaoTong) {
                    td.style.textDecoration = 'line-through';
                } else {
                    td.style.textDecoration = 'none';
                }

                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
            }
        },
        {
            data: 'canCu',
            title: 'Căn cứ',
            readOnly: false,
            width: 180,
            className: 'htMiddle',
            renderer: (instance: any, td: any, row: number, col: number, prop: string | number, value: any, cellProperties: any) => {
                const rowData = instance.getSourceDataAtRow(row);
                if (isReadOnly) {
                    cellProperties.readOnly = true;
                } else if (rowData.stt === 'II.2.1') {
                    cellProperties.readOnly = true;
                    td.style.setProperty('background-color', '#DFFFEA', 'important');
                } else if (rowData.stt?.includes('II.2.1.')) {
                    td.style.background = '#fff';
                    cellProperties.readOnly = false;
                } else {
                    cellProperties.readOnly = true;
                }

                if (rowData.stt === 'VI') {
                    td.style.setProperty('background-color', '#FFF4DE', 'important');
                } else if (rowData.loaiNhapLieu === LoaiNhapLieuChiPhi.TinhTongDuToan) {
                    td.style.setProperty('background-color', '#E1F0FF', 'important');
                }

                if (rowData.isSubHeader) {
                    td.style.fontWeight = '600';
                }
                td.innerText = value || '';
                return td;
            }
        }
    ], [isReadOnly]);

    return (
        <div className="animate-fade-in max-w-[1200px] mx-auto mt-4 w-full">
            <div className="mb-10">
                <h3 className="text-[16px] font-bold text-red-600 border-b border-gray-200 pb-2 mb-6 uppercase">
                    Phần 2. CHI TIẾT DỰ TOÁN
                </h3>

                <div className="w-full" >
                    <TDHotTable
                        ref={hotRef}
                        data={tableData}
                        columns={columns}
                        stretchH="all"
                        readOnly={false}
                        afterChange={calculateData}
                        contextMenu={{
                            items: {
                                "add_child_row": {
                                    name: 'Thêm dòng bên dưới',
                                    hidden: function (this: any) {
                                        const selected = this.getSelectedLast();
                                        if (!selected) return true;

                                        const rowIndex = selected[0];
                                        const rowData = this.getSourceDataAtRow(rowIndex) as any;
                                        return rowData?.stt !== 'II.2.1';
                                    },
                                    callback: function (this: any, key: string, selection: any[]) {
                                        const rowIndex = selection[0].end.row;
                                        handleAddRowBelow(rowIndex);
                                    }
                                },
                                "input_dinh_muc": {
                                    name: 'Nhập định mức',
                                    hidden: function (this: any) {
                                        const selected = this.getSelectedLast();
                                        if (!selected) return true;
                                        const rowIndex = selected[0];
                                        const rowData = this.getSourceDataAtRow(rowIndex) as any;
                                        return rowData?.stt !== 'VI';
                                    },
                                    callback: function (this: any, key: string, selection: any[]) {
                                        const rowIndex = selection[0].end.row;
                                        const rowData = this.getSourceDataAtRow(rowIndex) as any;
                                        setDinhMucRowIndex(rowIndex);
                                        setDinhMucValue(rowData.dinhMucNhapLieu || 0);
                                        setShowDinhMucModal(true);
                                    }
                                },
                                "hsep1": "---------",
                                "remove_row": {
                                    name: 'Xóa dòng',
                                    hidden: function (this: any) {
                                        const selected = this.getSelectedLast();
                                        if (!selected) return true;
                                        const rowData = this.getSourceDataAtRow(selected[0]) as any;
                                        return rowData?.stt?.includes('II.2.1.') ? false : true;
                                    }
                                },
                                "hsep2": "---------",
                                "legend": {
                                    name: 'Chú thích',
                                    callback: function () {
                                        setShowLegendModal(true);
                                    }
                                }
                            }
                        }}
                        wrapperStyle={{ height: '100%' }}
                    />
                </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-between mt-8 pt-6 border-t border-gray-100 gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2.5 rounded-lg font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                >
                    <i className="fa-solid fa-arrow-left"></i> Quay lại
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    className="px-8 py-3 rounded-lg font-bold bg-portal-primary hover:bg-portal-hover text-white flex items-center justify-center gap-2 transition"
                >
                    Gửi đề xuất <i className="fa-solid fa-paper-plane text-white"></i>
                </button>
            </div>
            <LegendModal show={showLegendModal} onHide={() => setShowLegendModal(false)} />
            <DinhMucModal
                show={showDinhMucModal}
                onHide={() => setShowDinhMucModal(false)}
                initialValue={dinhMucValue}
                phanLoai={phanLoai as LoaiBangChiPhi}
                onSave={(newValue) => {
                    if (dinhMucRowIndex !== null) {
                        const hotInstance = hotRef.current?.hotInstance;
                        if (hotInstance) {
                            hotInstance.setDataAtRowProp(dinhMucRowIndex, 'dinhMucNhapLieu', newValue);
                        }
                    }
                    setShowDinhMucModal(false);
                }}
            />
        </div>
    );
};

const DinhMucModal = ({ show, onHide, initialValue, onSave, phanLoai }: { show: boolean; onHide: () => void; initialValue: number; onSave: (val: number) => void; phanLoai?: LoaiBangChiPhi | null }) => {
    const [localValue, setLocalValue] = useState<number>(0);

    useEffect(() => {
        if (show) {
            setLocalValue(initialValue);
        }
    }, [show, initialValue]);

    const maxValue = phanLoai === LoaiBangChiPhi.MotBuoc ? 0.05 : 0.1;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Nhập định mức</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form layout="vertical">
                    <Form.Item label="Giá trị định mức">
                        <InputNumber
                            style={{ width: '100%' }}
                            value={localValue}
                            min={0}
                            max={maxValue}
                            step={0.001}
                            precision={3}
                            onChange={(val) => setLocalValue(val || 0)}
                        />
                        <div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                            <div>- Giá trị tối đa đối với dự án 1 bước là 0.05</div>
                            <div>- Giá trị tối đa đối với dự án 2 bước là 0.1</div>
                        </div>
                    </Form.Item>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-sm" onClick={onHide}>
                    Hủy
                </Button>
                <Button variant="primary" className="btn-sm" onClick={() => onSave(localValue)}>
                    Lưu
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const LegendModal = ({ show, onHide }: { show: boolean; onHide: () => void }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Chú thích bảng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, background: '#f0f0f0', border: '1px solid #ccc', marginRight: 10 }}></div>
                    <span>Chỉ đọc</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, background: '#fff', border: '1px solid #ccc', marginRight: 10 }}></div>
                    <span>Cho phép chỉnh sửa</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, background: '#DFFFEA', border: '1px solid #ccc', marginRight: 10 }}></div>
                    <span>Cho phép thêm dòng con (Dự án phần mềm)</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, background: '#FFF4DE', border: '1px solid #ccc', marginRight: 10 }}></div>
                    <span>Cho phép nhập định mức</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, background: '#E1F0FF', border: '1px solid #ccc', marginRight: 10 }}></div>
                    <span>Dòng tính tổng dự toán</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                    <div style={{ width: 25, height: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, border: '1px solid #ccc' }}>
                        <span style={{ textDecoration: 'line-through', fontSize: '10px' }}>123</span>
                    </div>
                    <span>Không cộng vào tổng</span>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className="btn-sm" onClick={onHide}>
                    Đóng
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
