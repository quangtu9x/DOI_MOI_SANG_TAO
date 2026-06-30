
import { useState } from 'react'
import * as Yup from 'yup'
import clsx from 'clsx'
import { useFormik } from 'formik'
import { getUserByToken, login } from '../core/_requests'
import { toAbsoluteUrl } from '../../../../_metronic/helpers'
import { useAuth } from '../core/Auth'

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

const VNA_BLUE = '#003087'
const VNA_GOLD = '#C5A028'

export function Login() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { saveAuth, setCurrentUser } = useAuth()

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
        setStatus('Bạn nhập sai tên đăng nhập hoặc mật khẩu!')
        setSubmitting(false)
        setLoading(false)
      }
    },
  })

  const isDisabled = formik.isSubmitting || !formik.isValid

  return (
    <form
      style={{ width: '100%' }}
      onSubmit={formik.handleSubmit}
      noValidate
      id='kt_login_signin_form'
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img
          src={toAbsoluteUrl('media/logos/logo-loading.png')}
          alt='Vietnam Airlines'
          style={{ height: 64, objectFit: 'contain', maxWidth: '100%' }}
        />
      </div>

      {/* Gold divider */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${VNA_GOLD}90)` }} />
        <div style={{ margin: '0 14px', color: VNA_GOLD, fontSize: 13 }}>✦</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${VNA_GOLD}90)` }} />
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{
          color: VNA_BLUE, fontWeight: 800, letterSpacing: '0.07em',
          fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', marginBottom: 8, lineHeight: 1.2,
        }}>
          ĐĂNG NHẬP HỆ THỐNG
        </h2>
        <p style={{ color: '#888', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)', margin: 0, letterSpacing: '0.03em' }}>
          Quản trị Đổi mới Sáng tạo · Vietnam Airlines
        </p>
      </div>

      {/* Error alert */}
      {formik.status && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          padding: '12px 16px', borderRadius: 8,
          background: '#fff2f0', border: '1px solid #ffccc7', color: '#cf1322',
          fontSize: '0.9rem',
        }}>
          <i className='fa-solid fa-circle-exclamation' style={{ flexShrink: 0 }} />
          <span>{formik.status}</span>
        </div>
      )}

      {/* Username */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: VNA_BLUE, fontSize: '0.95rem' }}>
          Tài khoản
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#aaa', pointerEvents: 'none',
          }}>
            <i className='fa-regular fa-user' style={{ fontSize: 15 }} />
          </span>
          <input
            placeholder='Nhập tài khoản'
            {...formik.getFieldProps('userName')}
            className={clsx(
              'form-control',
              { 'is-invalid': formik.touched.userName && formik.errors.userName },
              { 'is-valid': formik.touched.userName && !formik.errors.userName }
            )}
            style={{ paddingLeft: 46, borderRadius: 10, height: 52, fontSize: '0.95rem', borderColor: '#ddd' }}
            type='text'
            name='userName'
            autoComplete='off'
          />
        </div>
        {formik.touched.userName && formik.errors.userName && (
          <div style={{ color: '#cf1322', marginTop: 6, fontSize: '0.82rem' }}>{formik.errors.userName}</div>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: VNA_BLUE, fontSize: '0.95rem' }}>
          Mật khẩu
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 46,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#aaa', pointerEvents: 'none',
          }}>
            <i className='fa-regular fa-lock' style={{ fontSize: 15 }} />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete='off'
            placeholder='Nhập mật khẩu'
            {...formik.getFieldProps('password')}
            className={clsx(
              'form-control',
              { 'is-invalid': formik.touched.password && formik.errors.password },
              { 'is-valid': formik.touched.password && !formik.errors.password }
            )}
            style={{ paddingLeft: 46, paddingRight: 50, borderRadius: 10, height: 52, fontSize: '0.95rem', borderColor: '#ddd' }}
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            style={{
              position: 'absolute', right: 0, top: 0, bottom: 0, width: 46,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', background: 'transparent', cursor: 'pointer', color: '#aaa', padding: 0,
            }}
          >
            <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ fontSize: 15 }} />
          </button>
        </div>
        {formik.touched.password && formik.errors.password && (
          <div style={{ color: '#cf1322', marginTop: 6, fontSize: '0.82rem' }}>{formik.errors.password}</div>
        )}
      </div>

      {/* Submit button */}
      <button
        type='submit'
        id='kt_sign_in_submit'
        disabled={isDisabled}
        style={{
          width: '100%',
          height: 54,
          fontSize: '1rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          borderRadius: 10,
          border: 'none',
          color: '#fff',
          background: isDisabled ? '#b0b0b0' : `linear-gradient(135deg, ${VNA_BLUE} 0%, #0046A6 100%)`,
          borderBottom: `3px solid ${isDisabled ? '#999' : VNA_GOLD}`,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? 'none' : '0 6px 24px rgba(0,48,135,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'opacity 0.2s, box-shadow 0.2s',
        }}
      >
        {loading ? (
          <>
            <span
              className='spinner-border spinner-border-sm'
              style={{ color: '#fff', width: 18, height: 18, borderWidth: 2 }}
            />
            <span style={{ color: '#fff' }}>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <i className='fa-solid fa-right-to-bracket' style={{ color: '#fff', fontSize: 16 }} />
            <span style={{ color: '#fff' }}>ĐĂNG NHẬP</span>
          </>
        )}
      </button>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 28, color: '#bbb', fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} Tổng Công ty Hàng không Việt Nam – Vietnam Airlines
      </div>
    </form>
  )
}
