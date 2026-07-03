import React, { useState } from 'react';
import { Spin } from 'antd';
import { Content } from '@/_metronic/layout/components/content';
import { PageTitle } from '@/_metronic/layout/core';

const FEED_EMBED_URL = 'https://blvs.hanhchinhcong.net/embed/social/feed';

export const NewsFeedPage: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <PageTitle breadcrumbs={[
        { title: 'Đổi mới sáng tạo', path: '/doi-moi-sang-tao/dashboard', isActive: false, isSeparator: false },
        { title: 'Kho tri thức', path: '/doi-moi-sang-tao/kho-tri-thuc', isActive: false, isSeparator: false },
      ]}>Bảng tin</PageTitle>

      <Content>
        <Spin spinning={loading} tip="Đang tải bảng tin...">
          <div className="shadow-sm overflow-hidden" style={{ borderRadius: 12, background: '#fff' }}>
            <iframe
              src={FEED_EMBED_URL}
              title="Bảng tin"
              onLoad={() => setLoading(false)}
              style={{
                width: '100%',
                height: 'calc(100vh - 220px)',
                minHeight: 600,
                border: 'none',
                display: 'block',
              }}
              allow="clipboard-write; fullscreen"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Spin>
      </Content>
    </>
  );
};
