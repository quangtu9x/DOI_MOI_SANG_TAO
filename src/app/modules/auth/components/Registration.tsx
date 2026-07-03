import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StepperComponent } from '../../../../_metronic/assets/ts/components';
import { PasswordMeterComponent } from '../../../../_metronic/assets/ts/components';
import { useAuth } from '../core/Auth';
import { register } from '../core/_requests';
import { searchPublicOrganizationUnits } from '@/services/organizationUnit.service';
import { IOrganizationUnit, UserPurpose, UserType } from '@/models';
import { OrganizationUnitTreeSelect } from '@/app/components';


const initialValues = {
  accountType: 'canhan', // không lưu
  type: UserType.FromPortal,
  purposes: [] as UserPurpose[],
  username: '',
  displayName: '',
  email: '',
  organizationUnitId: undefined as string | undefined,
  password: '',
  confirmPassword: '',
};

const registrationSchema = [
  // Step 1 schema
  Yup.object().shape({
    accountType: Yup.string().required('Loại tài khoản là bắt buộc'),
  }),
  // Step 2 schema
  Yup.object().shape({
    purposes: Yup.array().min(1, 'Vui lòng chọn ít nhất một mục đích'),
  }),
  // Step 3 schema
  Yup.object().shape({
    username: Yup.string().min(3, 'Tối thiểu 3 ký tự').max(50, 'Tối đa 50 ký tự').required('Tên tài khoản là bắt buộc'),
    displayName: Yup.string().min(3, 'Tối thiểu 3 ký tự').max(50, 'Tối đa 50 ký tự').required('Tên hiển thị là bắt buộc'),
    email: Yup.string().email('Định dạng email không hợp lệ').required('Email là bắt buộc'),
    password: Yup.string().min(3, 'Tối thiểu 3 ký tự').max(50, 'Tối đa 50 ký tự').required('Mật khẩu là bắt buộc'),
    confirmPassword: Yup.string()
      .required('Xác nhận mật khẩu là bắt buộc')
      .oneOf([Yup.ref('password')], 'Mật khẩu không khớp'),
    organizationUnitId: Yup.string().when('purposes', {
      is: (purposes: UserPurpose[]) => purposes?.includes(UserPurpose.DuAnCNTT),
      then: (schema) => schema.required('Đơn vị là bắt buộc'),
      otherwise: (schema) => schema.optional(),
    }),
  }),
];

export function Registration() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [units, setUnits] = useState<IOrganizationUnit[]>([]);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const stepperObj = useRef<StepperComponent | null>(null);

  useEffect(() => {
    if (stepperRef.current) {
      stepperObj.current = StepperComponent.createInsance(stepperRef.current);
    }
    PasswordMeterComponent.bootstrap();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await searchPublicOrganizationUnits({
          pageNumber: 1,
          pageSize: 1000,
          isActive: true
        });
        setUnits(res.data || []);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };
    fetchUnits();
  }, []);

  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema[currentStep],
    onSubmit: async (values, { setStatus, setSubmitting, setTouched }) => {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
        stepperObj.current?.goNext();
        setSubmitting(false);
        setTouched({}); // Reset touched state when moving to next step
        return;
      }

      setLoading(true);
      try {
        await register(
          values.email,
          values.displayName,
          values.username,
          values.password,
          values.confirmPassword,
          values.type,
          values.purposes,
          values.organizationUnitId
        );
        toast.success('Đăng ký tài khoản thành công!');
        navigate('/auth/login');
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus('Thông tin đăng ký không chính xác');
        setSubmitting(false);
        setLoading(false);
      }
      finally {
        setLoading(false);
      }
    },
  });

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      stepperObj.current?.goPrev();
      formik.setTouched({});
    }
  };

  const handlePurposeChange = (purpose: UserPurpose) => {
    const newPurposes = [...formik.values.purposes];
    if (newPurposes.includes(purpose)) {
      formik.setFieldValue('purposes', newPurposes.filter(p => p !== purpose));
    } else {
      formik.setFieldValue('purposes', [...newPurposes, purpose]);
    }
  };

  return (
    <div className='w-100'>
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>ĐĂNG KÝ TÀI KHOẢN</h1>
      </div>
      <div
        ref={stepperRef}
        className='stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid'
        id='kt_modal_create_app_stepper'
      >
        {/* begin::Aside*/}
        <div className='d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-250px'>
          {/* begin::Nav*/}
          <div className='stepper-nav'>
            {/* begin::Step 1*/}
            <div className={clsx('stepper-item', { current: currentStep === 0 })} data-kt-stepper-element='nav'>
              <div className='stepper-wrapper'>
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>1</span>
                </div>
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Loại tài khoản</h3>
                  <div className='stepper-desc'>Chọn loại tài khoản</div>
                </div>
              </div>
              <div className='stepper-line h-40px'></div>
            </div>
            {/* end::Step 1*/}

            {/* begin::Step 2*/}
            <div className={clsx('stepper-item', { current: currentStep === 1 })} data-kt-stepper-element='nav'>
              <div className='stepper-wrapper'>
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>2</span>
                </div>
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Mục đích</h3>
                  <div className='stepper-desc'>Chọn mục đích đăng ký</div>
                </div>
              </div>
              <div className='stepper-line h-40px'></div>
            </div>
            {/* end::Step 2*/}

            {/* begin::Step 3*/}
            <div className={clsx('stepper-item', { current: currentStep === 2 })} data-kt-stepper-element='nav'>
              <div className='stepper-wrapper'>
                <div className='stepper-icon w-40px h-40px'>
                  <i className='stepper-check fas fa-check'></i>
                  <span className='stepper-number'>3</span>
                </div>
                <div className='stepper-label'>
                  <h3 className='stepper-title'>Thông tin</h3>
                  <div className='stepper-desc'>Nhập thông tin cá nhân</div>
                </div>
              </div>
            </div>
            {/* end::Step 3*/}
          </div>
          {/* end::Nav*/}
        </div>
        {/* end::Aside*/}

        {/* begin::Content*/}
        <div className='flex-row-fluid '>
          <form className='form w-100' noValidate id='kt_login_signup_form' onSubmit={formik.handleSubmit}>
            {/* begin::Step 1*/}
            <div className={clsx({ current: currentStep === 0 })} data-kt-stepper-element='content'>
              <div className='w-100'>
                <div className='pb-10 '>
                  <h2 className='fw-bolder text-gray-900'>Chọn loại tài khoản</h2>
                  <div className='text-gray-500 fw-semibold fs-6'>
                    Vui lòng chọn loại tài khoản phù hợp với bạn
                  </div>
                </div>

                <div className='fv-row'>
                  <div className='row'>
                    <div className='col-lg-12'>
                      <input
                        type='radio'
                        className='btn-check'
                        name='accountType'
                        value='canhan'
                        checked={formik.values.accountType === 'canhan'}
                        onChange={formik.handleChange}
                        id='kt_account_type_canhan'
                      />
                      <label
                        className='btn btn-outline btn-outline-dashed btn-outline-default p-5 d-flex align-items-center mb-10'
                        htmlFor='kt_account_type_canhan'
                      >
                        <i className='fa-regular fa-user fs-2x me-3'></i>
                        <span className='d-block fw-semibold text-start'>
                          <span className='text-gray-900 fw-bolder d-block fs-4 mb-2'>Cá nhân</span>
                          <span className='text-gray-500 fw-semibold fs-6'>Tài khoản dành cho cá nhân nghiên cứu</span>
                        </span>
                      </label>
                    </div>

                    <div className='col-lg-12'>
                      <input
                        type='radio'
                        className='btn-check'
                        name='accountType'
                        value='tochuc'
                        checked={formik.values.accountType === 'tochuc'}
                        onChange={formik.handleChange}
                        id='kt_account_type_tochuc'
                      />
                      <label
                        className='btn btn-outline btn-outline-dashed btn-outline-default p-5 d-flex align-items-center mb-10'
                        htmlFor='kt_account_type_tochuc'
                      >
                        <i className='fa-regular fa-building fs-2x me-3'></i>
                        <span className='d-block fw-semibold text-start'>
                          <span className='text-gray-900 fw-bolder d-block fs-4 mb-2'>Tổ chức</span>
                          <span className='text-gray-500 fw-semibold fs-6'>Tài khoản dành cho các tổ chức, đơn vị nhà nước</span>
                        </span>
                      </label>
                    </div>

                    <div className='col-lg-12'>
                      <input
                        type='radio'
                        className='btn-check'
                        name='accountType'
                        value='doanhnghiep'
                        checked={formik.values.accountType === 'doanhnghiep'}
                        onChange={formik.handleChange}
                        id='kt_account_type_doanhnghiep'
                      />
                      <label
                        className='btn btn-outline btn-outline-dashed btn-outline-default p-5 d-flex align-items-center'
                        htmlFor='kt_account_type_doanhnghiep'
                      >
                        <i className='fa-regular fa-briefcase fs-2x me-3'></i>
                        <span className='d-block fw-semibold text-start'>
                          <span className='text-gray-900 fw-bolder d-block fs-4 mb-2'>Doanh nghiệp</span>
                          <span className='text-gray-500 fw-semibold fs-6'>Tài khoản dành cho các doanh nghiệp, công ty</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* end::Step 1*/}

            {/* begin::Step 2*/}
            <div className={clsx({ current: currentStep === 1 })} data-kt-stepper-element='content'>
              <div className='w-100'>
                <div className='pb-10 '>
                  <h2 className='fw-bolder text-gray-900'>Mục đích đăng ký</h2>
                  <div className='text-gray-500 fw-semibold fs-6'>
                    Chọn một hoặc nhiều mục đích sử dụng hệ thống
                  </div>
                </div>

                <div className='fv-row'>
                  <div className='d-flex flex-column'>
                    <label className='form-check form-check-custom form-check-solid mb-10'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={formik.values.purposes.includes(UserPurpose.DoiMoiSangTao)}
                        onChange={() => handlePurposeChange(UserPurpose.DoiMoiSangTao)}
                      />
                      <span className='form-check-label fw-semibold text-gray-700 fs-6'>
                        Tham gia Đổi mới sáng tạo (gửi ý tưởng, sáng kiến, kho tri thức)
                      </span>
                    </label>

                    <label className='form-check form-check-custom form-check-solid mb-10'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={formik.values.purposes.includes(UserPurpose.NhiemVuKhoaHoc)}
                        onChange={() => handlePurposeChange(UserPurpose.NhiemVuKhoaHoc)}
                      />
                      <span className='form-check-label fw-semibold text-gray-700 fs-6'>
                        Đăng ký nhiệm vụ nghiên cứu khoa học
                      </span>
                    </label>

                    <label className='form-check form-check-custom form-check-solid mb-10'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={formik.values.purposes.includes(UserPurpose.SangKienKhoaHoc)}
                        onChange={() => handlePurposeChange(UserPurpose.SangKienKhoaHoc)}
                      />
                      <span className='form-check-label fw-semibold text-gray-700 fs-6'>
                        Đăng ký sáng kiến
                      </span>
                    </label>

                    <label className='form-check form-check-custom form-check-solid'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        checked={formik.values.purposes.includes(UserPurpose.DuAnCNTT)}
                        onChange={() => handlePurposeChange(UserPurpose.DuAnCNTT)}
                      />
                      <span className='form-check-label fw-semibold text-gray-700 fs-6'>
                        Đăng ký vốn dự án CNTT
                      </span>
                    </label>
                  </div>
                  {formik.touched.purposes && formik.errors.purposes && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert' className='text-danger'>{formik.errors.purposes as string}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* end::Step 2*/}

            {/* begin::Step 3*/}
            <div className={clsx({ current: currentStep === 2 })} data-kt-stepper-element='content'>
              <div className='w-100'>
                <div className='pb-10 pb-lg-12'>
                  <h2 className='fw-bolder text-gray-900'>Thông tin tài khoản</h2>
                  <div className='text-gray-500 fw-semibold fs-6'>
                    Nhập thông tin chi tiết để hoàn tất đăng ký
                  </div>
                </div>

                {formik.status && (
                  <div className='mb-lg-10 alert alert-danger'>
                    <div className='alert-text font-weight-bold'>{formik.status}</div>
                  </div>
                )}

                <div className='fv-row mb-4'>
                  <label className='form-label fw-bolder text-gray-900 fs-6'>Tên tài khoản</label>
                  <input
                    placeholder='Tên tài khoản'
                    type='text'
                    autoComplete='off'
                    {...formik.getFieldProps('username')}
                    className={clsx(
                      'form-control bg-transparent',
                      { 'is-invalid': formik.touched.username && formik.errors.username },
                      { 'is-valid': formik.touched.username && formik.values.username && !formik.errors.username }
                    )}
                  />
                  {formik.touched.username && formik.errors.username && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{formik.errors.username}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-4'>
                  <label className='form-label fw-bolder text-gray-900 fs-6'>Tên hiển thị</label>
                  <input
                    placeholder='Tên hiển thị'
                    type='text'
                    autoComplete='off'
                    {...formik.getFieldProps('displayName')}
                    className={clsx(
                      'form-control bg-transparent',
                      { 'is-invalid': formik.touched.displayName && formik.errors.displayName },
                      { 'is-valid': formik.touched.displayName && formik.values.displayName && !formik.errors.displayName }
                    )}
                  />
                  {formik.touched.displayName && formik.errors.displayName && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{formik.errors.displayName}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className='fv-row mb-4'>
                  <label className='form-label fw-bolder text-gray-900 fs-6'>Email</label>
                  <input
                    placeholder='Email'
                    type='email'
                    autoComplete='off'
                    {...formik.getFieldProps('email')}
                    className={clsx(
                      'form-control bg-transparent',
                      { 'is-invalid': formik.touched.email && formik.errors.email },
                      { 'is-valid': formik.touched.email && formik.values.email && !formik.errors.email }
                    )}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{formik.errors.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                {formik.values.purposes.includes(UserPurpose.DuAnCNTT) && (
                  <div className='fv-row mb-4'>
                    <label className='form-label fw-bolder text-gray-900 fs-6'>Đơn vị</label>
                    <OrganizationUnitTreeSelect
                      fetchOrganizationUnits={async () => {
                        const res = await searchPublicOrganizationUnits({
                          pageNumber: 1,
                          pageSize: 1000,
                          isActive: true,
                          keyword: ''
                        });
                        return res.data || [];
                      }}
                      placeholder='Chọn đơn vị'
                      value={formik.values.organizationUnitId}
                      onChange={(val) => formik.setFieldValue('organizationUnitId', val)}
                      status={formik.touched.organizationUnitId && formik.errors.organizationUnitId ? 'error' : ''}
                    />
                    {formik.touched.organizationUnitId && formik.errors.organizationUnitId && (
                      <div className='fv-plugins-message-container'>
                        <div className='fv-help-block'>
                          <span role='alert'>{formik.errors.organizationUnitId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className='fv-row mb-4' data-kt-password-meter='true'>
                  <div className='mb-1'>
                    <label className='form-label fw-bolder text-gray-900 fs-6'>Mật khẩu</label>
                    <div className='position-relative mb-3'>
                      <input
                        type='password'
                        placeholder='Mật khẩu'
                        autoComplete='off'
                        {...formik.getFieldProps('password')}
                        className={clsx(
                          'form-control bg-transparent',
                          { 'is-invalid': formik.touched.password && formik.errors.password },
                          { 'is-valid': formik.touched.password && formik.values.password && !formik.errors.password }
                        )}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <div className='fv-plugins-message-container'>
                          <div className='fv-help-block'>
                            <span role='alert'>{formik.errors.password}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className='d-flex align-items-center mb-3' data-kt-password-meter-control='highlight'>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2'></div>
                      <div className='flex-grow-1 bg-secondary bg-active-success rounded h-5px'></div>
                    </div>
                  </div>
                  <div className='text-muted'>Sử dụng 8 ký tự trở lên với sự kết hợp của chữ cái, số và ký hiệu.</div>
                </div>

                <div className='fv-row mb-5'>
                  <label className='form-label fw-bolder text-gray-900 fs-6'>Xác nhận mật khẩu</label>
                  <input
                    type='password'
                    placeholder='Xác nhận mật khẩu'
                    autoComplete='off'
                    {...formik.getFieldProps('confirmPassword')}
                    className={clsx(
                      'form-control bg-transparent',
                      { 'is-invalid': formik.touched.confirmPassword && formik.errors.confirmPassword },
                      { 'is-valid': formik.touched.confirmPassword && formik.values.confirmPassword && !formik.errors.confirmPassword }
                    )}
                  />
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>
                        <span role='alert'>{formik.errors.confirmPassword}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* end::Step 3*/}

            {/* begin::Actions*/}
            <div className='d-flex flex-stack pt-15'>
              <div className='mr-2'>
                <button
                  type='button'
                  className='btn btn-lg btn-light-primary me-3'
                  onClick={prevStep}
                  style={{ display: currentStep === 0 ? 'none' : 'inline-block' }}
                >
                  <i className='fas fa-arrow-left fs-4 me-1'></i> Quay lại
                </button>
              </div>

              <div>
                <button
                  type='submit'
                  className='btn btn-lg btn-primary'
                  disabled={formik.isSubmitting || !formik.isValid}
                >
                  {currentStep === 2 ? (
                    <>
                      {!loading && <span className='indicator-label'>Hoàn tất <i className='fas fa-check fs-4 ms-2'></i></span>}
                      {loading && (
                        <span className='indicator-progress' style={{ display: 'block' }}>
                          Vui lòng đợi... <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      Tiếp theo <i className='fas fa-arrow-right fs-4 ms-2'></i>
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* end::Actions*/}
          </form>
        </div>
        {/* end::Content*/}
      </div>
    </div>
  );
}
