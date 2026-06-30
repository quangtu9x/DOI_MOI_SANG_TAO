
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { toAbsoluteUrl } from '../../../_metronic/helpers'

const VNA_BLUE = '#003087'
const VNA_GOLD = '#C5A028'

const FEATURES = [
  {
    icon: 'fa-lightbulb',
    title: 'Quản lý Ý tưởng & Sáng kiến',
    desc: 'Tiếp nhận, xử lý và theo dõi vòng đời ý tưởng đổi mới toàn Tổng Công ty',
  },
  {
    icon: 'fa-brain',
    title: 'Kho Tri thức Thông minh',
    desc: 'Chia sẻ tài liệu, tư vấn chuyên gia và tìm kiếm ngữ nghĩa bằng AI',
  },
  {
    icon: 'fa-chart-line',
    title: 'Dashboard & Báo cáo',
    desc: 'Phân tích dữ liệu theo thời gian thực, hỗ trợ quyết định ban lãnh đạo',
  },
]

const AuthLayout = () => {
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) root.style.height = '100%'
    return () => {
      if (root) root.style.height = 'auto'
    }
  }, [])

  return (
    <>
      <style>{`
        .vna-auth-root {
          display: flex;
          min-height: 100vh;
          flex-direction: column;
        }
        /* Mobile banner */
        .vna-mobile-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: linear-gradient(135deg, ${VNA_BLUE} 0%, #0046A6 100%);
          border-bottom: 3px solid ${VNA_GOLD};
        }
        /* Form panel */
        .vna-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 24px 48px;
          background: #fff;
          position: relative;
          overflow-y: auto;
        }
        /* Desktop branding panel */
        .vna-brand-panel {
          display: none;
        }
        @media (min-width: 992px) {
          .vna-auth-root {
            flex-direction: row;
            height: 100vh;
            overflow: hidden;
          }
          .vna-mobile-banner {
            display: none;
          }
          .vna-form-panel {
            width: 44%;
            flex: none;
            padding: 48px 64px;
          }
          .vna-brand-panel {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            position: relative;
            overflow: hidden;
          }
        }
        @media (min-width: 1400px) {
          .vna-form-panel {
            padding: 56px 80px;
          }
        }
      `}</style>

      <div className='vna-auth-root'>

        {/* ── Mobile top banner ── */}
        <div className='vna-mobile-banner'>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: VNA_GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <i className='fa-solid fa-plane' style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.15em', color: VNA_GOLD, lineHeight: 1.2 }}>
              VIETNAM AIRLINES
            </div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em' }}>
              Hệ thống Quản trị Đổi mới Sáng tạo
            </div>
          </div>
        </div>

        {/* ── Form panel ── */}
        <div className='vna-form-panel'>
          {/* Top accent stripe */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, ${VNA_BLUE} 0%, ${VNA_GOLD} 100%)`,
          }} />

          <div style={{ width: '100%', maxWidth: 460 }}>
            <Outlet />
          </div>

          <div style={{
            position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center',
            color: '#ccc', fontSize: '0.68rem', letterSpacing: '0.02em',
          }}>
            <i className='fa-regular fa-shield-check me-1' />
            Được bảo mật bởi Vietnam Airlines Security Framework
          </div>
        </div>

        {/* ── Branding panel (desktop only) ── */}
        <div
          className='vna-brand-panel'
          style={{
            backgroundImage: `url(${toAbsoluteUrl('media/images/dang_nhap.jpg')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(140deg, ${VNA_BLUE}F5 0%, #001A55EE 55%, rgba(0,0,0,0.6) 100%)`,
          }} />

          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 500, height: 500, borderRadius: '50%',
            border: `1px solid ${VNA_GOLD}20`, pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 320, height: 320, borderRadius: '50%',
            border: `1px solid ${VNA_GOLD}15`, pointerEvents: 'none',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1, padding: '56px 64px', color: '#fff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

            {/* Brand header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${VNA_GOLD} 0%, #A8871C 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 18px ${VNA_GOLD}55`,
              }}>
                <i className='fa-solid fa-plane' style={{ color: '#fff', fontSize: 24 }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.18em', color: VNA_GOLD, lineHeight: 1.2 }}>
                  VIETNAM AIRLINES
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', marginTop: 3 }}>
                  BÔNG SEN VÀNG
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, color: '#fff' }}>
              Hệ thống Quản trị<br />
              <span style={{ color: VNA_GOLD }}>Đổi mới Sáng tạo</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 420, marginBottom: 48 }}>
              Nền tảng thống nhất để tiếp nhận, quản lý và triển khai các ý tưởng,
              sáng kiến đổi mới trong toàn Tổng Công ty.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(197,160,40,0.15)', border: `1px solid ${VNA_GOLD}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className={`fa-regular ${f.icon}`} style={{ color: VNA_GOLD, fontSize: 18 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div style={{
              position: 'absolute', bottom: 28, left: 64, right: 64,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 18,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.73rem' }}>
                © {new Date().getFullYear()} Vietnam Airlines
              </span>
              <span style={{ color: VNA_GOLD, fontSize: '0.73rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                Đổi mới · Sáng tạo · Bay cao
              </span>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export { AuthLayout }
