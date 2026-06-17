
import { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { getUserByToken, login } from '../core/_requests'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { useAuth } from '../core/Auth'
import { toast } from 'react-toastify';

const loginSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Vui lòng nhập tài khoản!'),
  password: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Vui lòng nhập mật khẩu!'),
})

const initialValues = {
  userName: 'root.admin',
  password: 'Demo@123',
}



export function Login() {
  const [loading, setLoading] = useState(false)
  const { saveAuth, setCurrentUser } = useAuth()
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true)
      try {
        const { data: auth } = await login(values.userName, values.password)
        saveAuth(auth)
        const { data: user } = await getUserByToken()
        setCurrentUser(user)
      } catch (error) {
        saveAuth(undefined)
        //  toast.error('Bạn nhập sai tên đăng nhập hoặc mật khẩu!');
        setStatus('Bạn nhập sai tên đăng nhập hoặc mật khẩu!')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  return (
    <form
      className='form w-lg-500px'
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      <div className='text-center mb-11'>
        <img src='/media/logos/logo-loading.png' height={120}></img>
      </div>
      {/* begin::Heading */}
      <div className='text-center mb-11'>
        <h1 className='text-gray-900 fw-bolder mb-3'>ĐĂNG NHẬP</h1>
        <h1 className='text-gray-900 fw-semibold fs-3'>HỆ THỐNG QUẢN LÝ ĐẦU TƯ, ỨNG DỤNG CNTT, CĐS, KHCN TRÊN ĐỊA BÀN THÀNH PHỐ</h1>
      </div>

      <div className='text-center mb-11' style={{ height: '20px' }}>

      </div>

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-label fs-6 fw-bolder text-gray-900'>Tài khoản</label>
        <input
          placeholder=''
          {...formik.getFieldProps('userName')}
          className={clsx(
            'form-control bg-transparent',
            { 'is-invalid': formik.touched.userName && formik.errors.userName },
            {
              'is-valid': formik.touched.userName && !formik.errors.userName,
            }
          )}
          type='text'
          name='userName'
          autoComplete='off'
        />
        {formik.touched.userName && formik.errors.userName && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.userName}</span>
            </div></div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Form group */}
      <div className='fv-row mb-8'>
        <label className='form-label fw-bolder text-gray-900 '>Mật khẩu</label>
        <input
          type='password'
          autoComplete='off'
          {...formik.getFieldProps('password')}
          className={clsx(
            'form-control bg-transparent',
            {
              'is-invalid': formik.touched.password && formik.errors.password,
            },
            {
              'is-valid': formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className='fv-plugins-message-container'>
            <div className='fv-help-block'>
              <span role='alert'>{formik.errors.password}</span>
            </div>
          </div>
        )}
        {formik.status && formik.status !== '' && (
          <div className='fv-plugins-message-container mt-3'>
            <span role='alert' className='text-danger fs-6'>
              {formik.status}
            </span>
          </div>
        )}
      </div>
      {/* end::Form group */}

      {/* begin::Wrapper */}
      <div className='d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8'>
        <div />

        {/* begin::Link */}
        {/* <Link to='/auth/forgot-password' className='link-primary'>
          Forgot Password ?
        </Link> */}
        {/* end::Link */}
      </div>
      {/* end::Wrapper */}

      {/* begin::Action */}
      <div className='d-grid mb-10'>
        <button
          type='submit'
          id='kt_sign_in_submit'
          className='btn btn-primary'
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className='indicator-label'>Đăng nhập</span>}
          {loading && (
            <span className='indicator-progress' style={{ display: 'block' }}>
              Đang đăng nhập...
              <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
            </span>
          )}
        </button>
      </div>
      {/* end::Action */}

      {/* <div className='text-gray-500 text-center fw-semibold fs-6'>
        Not a Member yet?{' '}
        <Link to='/auth/registration' className='link-primary'>
          Sign up
        </Link>
      </div> */}
    </form>
  )
}
