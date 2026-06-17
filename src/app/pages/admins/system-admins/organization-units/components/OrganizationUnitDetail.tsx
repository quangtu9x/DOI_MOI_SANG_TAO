import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/Store';

const OrganizationUnitDetail = () => {
  const dispatch: AppDispatch = useDispatch();

  const currentOrganizationUnit = useSelector((state: RootState) => state.organizationUnit.selectedOrganizationUnit);

  const onChange = (key: string) => {
    console.log(key);
  };
  return (
    <>
      <div className="d-flex flex-column">
        {currentOrganizationUnit ? (
          <>
            <div className="row td-row-dashed">
              <label className="col-lg-3 fw-bold text-muted">Tên đơn vị</label>
              <div className="col-lg-9">
                <span className="fw-bold fs-6 text-gray-900">{currentOrganizationUnit?.name}</span>
              </div>
            </div>
            <div className="row td-row-dashed">
              <label className="col-lg-3 fw-bold text-muted">Tên viết tắt</label>
              <div className="col-lg-9">
                <span className="fw-bold fs-6 text-gray-900">{currentOrganizationUnit?.name}</span>
              </div>
            </div>
            <div className="row td-row-dashed">
              <label className="col-lg-3 fw-bold text-muted">Mã định danh</label>
              <div className="col-lg-9">
                <span className="fw-bold fs-6 text-gray-900">{currentOrganizationUnit?.code}</span>
              </div>
            </div>
            <div className="row td-row-dashed">
              <label className="col-lg-3 fw-bold text-muted">Thông tin</label>
              <div className="col-lg-9">
                <span className="fw-bold fs-6 text-gray-900">{currentOrganizationUnit?.description}</span>
              </div>
            </div>
          </>
        ) : (
          <>Vui lòng lựa chọn đơn vị</>
        )}
      </div>
    </>
  );
};

export default OrganizationUnitDetail;
