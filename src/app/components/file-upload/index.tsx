import React from 'react';
import { getAuth } from '@/app/modules/auth';
import { Button, Upload } from 'antd';
import { toast } from 'react-toastify';

const { Dragger } = Upload;

const truncateFileName = (name: string, startChars: number = 15, endChars: number = 15) => {
  if (!name || name.length <= startChars + endChars + 3) return name;
  const start = name.slice(0, startChars);
  const end = name.slice(-endChars);
  return `${start}...${end}`;
};

const MAX_FILE_SIZE_MB = 5; // Maximum 5MB

const FileUpload = props => {
  const {
    URL,
    fileList = [],
    onChange,
    headers,
    multiple,
    disabled,
    accept = [],
    maxCount = 0,
    customRequest,
    isUseAliyunOSS = false,
  } = props;
  const token = getAuth()?.token;
  const handlePreview = async file => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };
  const handleBeforeUpload = (file: File) => {
    if (maxCount > 0 && fileList.length >= maxCount) {
      toast.error(`Chỉ được phép tải lên tối đa: ${maxCount} file.`);
      return Upload.LIST_IGNORE;
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (Array.isArray(accept) && accept.length > 0 && !accept.includes(ext)) {
      toast.error(`Tệp tin không hợp lệ. Chỉ cho phép tải lên các tệp: ${accept}`);
      return Upload.LIST_IGNORE;
    }
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      toast.error(`File vượt quá dung lượng cho phép. Chỉ được phép tải lên file có dung lượng tối đa: ${MAX_FILE_SIZE_MB}MB.`);
      return Upload.LIST_IGNORE;
    }

    return true;
  };

  return (
    <>{!isUseAliyunOSS && (<Dragger
      accept={accept ? accept : null}
      maxCount={maxCount ? maxCount : null}
      multiple={multiple}
      name="files"
      action={`${URL}`}
      listType="picture"
      fileList={fileList}
      onPreview={handlePreview}
      onChange={onChange}
      headers={{
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }}
      disabled={disabled}
      customRequest={customRequest}
      beforeUpload={handleBeforeUpload}
    >
      {disabled ? (
        <></>
      ) : (
        <div>
          <p className="ant-upload-text">Thả tệp tin hoặc nhấp chuột để tải lên</p>
          <p className="ant-upload-hint">Đính kèm</p>
        </div>
      )}
    </Dragger>)}
      {isUseAliyunOSS && (
        <Upload
          accept={accept ? accept : null}
          maxCount={maxCount ? maxCount : null}
          multiple={multiple}
          name="files"
          action={`${URL}`}
          listType="text"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={onChange}
          headers={{
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          }}
          disabled={disabled}
          customRequest={customRequest}
          beforeUpload={handleBeforeUpload}
          className="w-100"
          itemRender={(originNode, file) => (
            <div className="ant-upload-list-item" title={file.name}>
              {React.cloneElement(originNode as React.ReactElement, {
                children: React.Children.map((originNode as React.ReactElement).props.children, child => {
                  if (child?.props?.className?.includes('ant-upload-list-item-name')) {
                    return React.cloneElement(child, {}, truncateFileName(file.name));
                  }
                  return child;
                })
              })}
            </div>
          )}
        >
          {disabled ? null : (
            <Button type="dashed" className="border-primary text-hover-primary border-hover-primary"
              icon={<i className="fa-regular fa-cloud-arrow-up me-2"></i>}>
              <span className='fw-thin'>Tải lên {maxCount && `(tối đa ${maxCount} tệp)`}</span>
            </Button>
          )}
        </Upload>
      )}

    </>
  );
};

export default FileUpload;
