import { useState, useEffect } from 'react';
import { Upload, Image, GetProp, UploadProps, ConfigProvider } from 'antd';
import './style.css'

import { getAuth } from '@/app/modules/auth/core/AuthHelpers';
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ImageUpload = props => {
  const { URL, fileList, onChange, headers, multiple, disabled, className, data } = props;
  const token = getAuth()?.token;

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreview = async file => {
    let preview = file.url;
    if (!preview) {
      if (!file.preview) {
        file.preview = getBase64(file.originFileObj as FileType);
      }
      if (file.preview instanceof Promise) {
        preview = await file.preview;
        file.preview = preview;
      } else {
        preview = file.preview;
      }
    }
    setPreviewImage(preview as string);
    setPreviewVisible(true);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewVisible) {
        e.stopImmediatePropagation();
        e.preventDefault();
        setPreviewVisible(false);
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [previewVisible]);

  return (
    <ConfigProvider
      theme={{
        components: {
          Image: {
            zIndexPopup: 2000,
          },
          Modal: {
            zIndexPopupBase: 1900,
          },
          Upload: {
            zIndexPopupBase: 1800,
          }
        }
      }}>
      <Upload
        className={className}
        multiple={multiple}
        name="files"
        accept="image/*"
        action={`${URL}`}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={onChange}
        data={data}
        headers={{
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }}
        disabled={disabled}
      >
        {(!!multiple || (fileList && fileList.length < 1)) && (
          <div>
            <i className={`${disabled ? 'text-muted ' : ''}fas fa-plus me-2`}></i>
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        )}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            getContainer: () => document.body,
            visible: previewVisible,
            onVisibleChange: (visible) => setPreviewVisible(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}

    </ConfigProvider>
  );
};

export default ImageUpload;
