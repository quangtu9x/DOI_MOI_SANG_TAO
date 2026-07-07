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

  const getFileHref = (file: any) => {
    if (file?.url) return file.url;
    if (file?.response?.data?.filePath) return file.response.data.filePath;
    if (file?.response?.data) return file.response.data;
    if (file?.originFileObj) return URL.createObjectURL(file.originFileObj as Blob);
    return '';
  };

  const renderUploadItem = (originNode: React.ReactElement, file: any) => {
    const href = getFileHref(file);
    const fileNameNode = React.Children.toArray(originNode.props.children).find((child: any) => child?.props?.className?.includes('ant-upload-list-item-name'));

    return React.cloneElement(originNode, {
      children: React.Children.map(originNode.props.children, child => {
        if (!child?.props?.className?.includes('ant-upload-list-item-name')) {
          return child;
        }

        return React.cloneElement(child, {
          children: (
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="text-truncate" style={{ maxWidth: 260 }}>
                {fileNameNode ? file.name : truncateFileName(file.name)}
              </span>
              {href ? (
                <>
                  <Button
                    size="small"
                    type="text"
                    icon={<i className="fa-regular fa-eye" />}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      window.open(href, '_blank', 'noopener,noreferrer');
                    }}
                    aria-label="Xem file"
                    title="Xem file"
                  />
                  <Button
                    size="small"
                    type="text"
                    icon={<i className="fa-regular fa-download" />}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    download={file.name}
                    aria-label="Tải xuống file"
                    title="Tải xuống file"
                  />
                </>
              ) : null}
            </div>
          ),
        });
      }),
    });
  };

  const handlePreview = async file => {
    const href = getFileHref(file);
    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
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
        itemRender={(originNode, file) => renderUploadItem(originNode as React.ReactElement, file)}
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
          itemRender={(originNode, file) => renderUploadItem(originNode as React.ReactElement, file)}
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
