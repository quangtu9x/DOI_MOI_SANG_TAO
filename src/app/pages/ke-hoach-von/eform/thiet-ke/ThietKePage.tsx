import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/redux/Store';
import { RootState } from '@/redux/RootReducer';
import * as actionsModal from '@/redux/modal/Actions';
import { SearchData } from '@/types';
import { Content } from '@/_metronic/layout/components/content';
import { DataTable, FieldsDataTable, FieldFormModal, PreviewFormModal } from './components';

export const ThietKePage = () => {
  const dispatch: AppDispatch = useDispatch();

  const [searchData, setSearchData] = useState<SearchData | undefined>(undefined);
  const [selectedEform, setSelectedEform] = useState<{ id: string; title: string } | null>(null);
  const [fieldFormVisible, setFieldFormVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [editFieldData, setEditFieldData] = useState<any>(null);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchData(prev => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  const handleSelectEform = (eform: { id: string; tieuDe: string }) => {
    setSelectedEform({ id: eform.id, title: eform.tieuDe });
  };

  const handleAddField = () => {
    setEditFieldData(null);
    setFieldFormVisible(true);
  };

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const handleBackToList = () => {
    setSelectedEform(null);
  };

  // Handle modal from redux (for edit)
  // React.useEffect(() => {
  //   if (modalVisible && modalData) {
  //     if (modalData.type === 'edit') {
  //       setEditFieldData(modalData.data);
  //       setFieldFormVisible(true);
  //       dispatch(actionsModal.setModalVisible(false));
  //     } else if (modalData.type === 'select') {
  //       handleSelectEform(modalData);
  //       dispatch(actionsModal.setModalVisible(false));
  //     }
  //   }
  // }, [modalVisible, modalData]);

  return (
    <>
      <Content>
        <div className="card card-xl-stretch mb-xl-9">
          <div className="px-3 py-3 border-bottom border-secondary border-bottom-solid d-flex align-items-center justify-content-between">
            {!selectedEform ? (
              <>
                <h3 className="card-title fw-bold text-header-td fs-4 mb-0">{'Quản lý các mẫu eform động'}</h3>
                <div className="card-toolbar">
                  <div className="btn-group me-2 w-250px">
                    <input type="text" className="form-control form-control-sm" placeholder="Nhập từ khoá tìm kiếm" onChange={handleKeywordChange} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="d-flex align-items-center">
                  <button className="btn btn-sm btn-light me-3" onClick={handleBackToList}>
                    <i className="fa fa-arrow-left me-2"></i>
                    Quay lại
                  </button>
                  <h3 className="card-title fw-bold text-header-td fs-4 mb-0">Thiết kế trường: {selectedEform.title}</h3>
                </div>
                <div className="card-toolbar">
                  <button className="btn btn-sm btn-info me-2" onClick={handlePreview}>
                    <i className="fa fa-eye me-2"></i>
                    Xem trước
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={handleAddField}>
                    <i className="fa fa-plus me-2"></i>
                    Thêm trường
                  </button>
                </div>
              </>
            )}
          </div>

          {!selectedEform ? (
            <DataTable searchData={searchData} onSelectEform={handleSelectEform} />
          ) : (
            <FieldsDataTable
              eformId={selectedEform.id}
              searchData={searchData}
              setFieldFormVisible={setFieldFormVisible}
              setEditFieldData={setEditFieldData}
            />
          )}
        </div>
      </Content>

      {/* Field Form Modal */}

      {fieldFormVisible && (
        <FieldFormModal
          visible={fieldFormVisible}
          onClose={() => {
            setFieldFormVisible(false);
            setEditFieldData(null);
          }}
          onSuccess={() => {
            // Refresh the fields table
            setSelectedEform(prev => (prev ? { ...prev } : null));
          }}
          eformId={selectedEform?.id || ''}
          editData={editFieldData}
        />
      )}

      {/* Preview Modal */}
      {previewVisible && (
        <PreviewFormModal
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          eformId={selectedEform?.id || ''}
          eformTitle={selectedEform?.title}
        />
      )}
    </>
  );
};
