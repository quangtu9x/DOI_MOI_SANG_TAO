import { FILE_URL } from './baseAPI';
import _ from 'lodash';
import { TDUploadFile } from '@/models/TDUploadFile';
import dayjs, { Dayjs } from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { AxiosResponse } from 'axios';
import { P } from '@/data';
import { data } from 'jquery';
import { FormInstance } from 'antd';
import { useEffect, useState } from 'react';
dayjs.extend(utc);
dayjs.extend(timezone);

const URL_REGEX =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => URL_REGEX.test(path);

export const getBase64 = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};


export const CheckRole = (roles?: string[], role?: string[]): boolean => {
  if (!roles?.length) return false;
  return roles.some(v => role?.includes(v));
};

/**
 * Kiểm tra xem currentPermissions có chứa ít nhất
 * một trong các requiredPermissions không.
 */
export const checkPermissions = (
  currentPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean => {
  if (!currentPermissions || currentPermissions.length === 0) return false;
  if (requiredPermissions.length === 0) return false;

  const permSet = new Set(currentPermissions);
  return requiredPermissions.some(perm => permSet.has(perm));
};


export const handleFiles = (files: TDUploadFile[]): string[] => {
  return files
    .map(file => {
      if (file.response?.data?.[0]?.url) {
        return file.response.data[0].url;
      }
      return file.path || '';
    })
    .filter(Boolean);
};

export const handleVideo = (files: TDUploadFile[]): {url: string, thumbnailUrl: string}[] => {
  return files
    .map(file => {
      if (file.response?.data?.[0]?.url) {
        return {
          url: file.response.data[0].url,
          thumbnailUrl: file.response.data[0].thumbnailUrl || ''
        };
      }
      return {
        url: file.path || '',
        thumbnailUrl: ''
      };
    })
    .filter(Boolean);
};

/**
 * Chuyển đổi chuỗi đường dẫn ảnh thành mảng đối tượng TDUploadFile
 * @param values - Chuỗi đường dẫn ảnh, phân tách bởi '##'
 * @param baseURL - URL cơ sở để tạo đường dẫn đầy đủ
 * @returns Mảng các đối tượng TDUploadFile
 */
export const handleImage = (values: string, baseURL: string = FILE_URL): TDUploadFile[] => {
  if (!values || values.trim() === '') return [];
  
  const arr = _.without(_.split(values, '##'), '');
  return arr.map((path, index) => {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    const isExternalUrl = cleanPath.startsWith('https://') || cleanPath.startsWith('http://');
    
    let fullUrl = isExternalUrl ? cleanPath : `${baseURL}${cleanPath}`;
    
    if (!isExternalUrl && baseURL && !baseURL.endsWith('/') && !cleanPath.startsWith('/')) {
      fullUrl = `${baseURL}/${cleanPath}`;
    }
    
    const fileName = cleanPath.substring(cleanPath.lastIndexOf('/') + 1) || `image_${index + 1}`;
    
    return {
      uid: _.uniqueId('img_'),
      name: fileName,
      status: 'done' as const,
      url: fullUrl,
      path: cleanPath,
      size: 0,
      type: 'image/jpeg',
      thumbUrl: fullUrl,
      percent: 100,
    };
  });
};


interface ImageElement {
  response?: {
    data: Array<{ url: string }>;
  };
  path?: string;
}

export const convertImage = (array: ImageElement[]): string => {
  const urls = array.map(element => element?.response?.data[0]?.url ?? element.path);
  return _.uniq(urls).join('##');
};

const VIETNAMESE_MAP = {
  from: 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ·/_,:;',
  to: 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd------',
};

export const toSlug = (str: string): string => {
  if (!str) return '';

  let result = str.trim().toLowerCase();

  // Replace Vietnamese characters
  for (let i = 0; i < VIETNAMESE_MAP.from.length; i++) {
    result = result.replace(new RegExp(VIETNAMESE_MAP.from.charAt(i), 'g'), VIETNAMESE_MAP.to.charAt(i));
  }

  return result
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const removeAccents = (str: string): string => {
  if (!str) return '';

  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9 -]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .toUpperCase();
};

export const handleKeyDownNumber = (e: any, value: any) => {
  const char = e.key;
  if ((e.ctrlKey || e.metaKey) && char.toLowerCase() === 'v') {
    return;
  }
  if (!/[0-9,]/.test(char) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
    e.preventDefault();
  }

  if (char === ',' && value.includes(',')) {
    e.preventDefault();
  }
};

export const stringNToFloat = (input: string) => {
  return (input && parseFloat(input.replace(/,/g, '.'))) ?? 0;
};
export const ConvertDateTime = (dt: any) => {
  if (dt) {
    return dayjs(dt)
      .tz('Asia/Ho_Chi_Minh') // Chuyển sang múi giờ UTC+7 (Asia/Ho_Chi_Minh)
      .format('YYYY-MM-DDTHH:mm:ss');
  } else {
    return null;
  }
};

export const handleKeyDownLetter = (e: any, value: any) => {
  const char = e.key;
  //if (/[0-9]/.test(char) && )

  if (/[0-9]/.test(char) || /[\[\]{};':"<>,./?!@#$%^&*()\-=+|\\^~`]/.test(char)) {
    e.preventDefault();
  }
  if (char === ',' && value.includes(',')) {
    e.preventDefault();
  }
};

export const handlePaste = (e: any) => {
  const pastedText = e.clipboardData.getData('text');
  if (/[\[\]{};':"<>,./?!@#$%^&*()\-=+|\\^~`]/.test(pastedText)) {
    e.preventDefault();
  }
};

export const handleKeyDownNumberText = (e: any, value: any) => {
  const char = e.key;
  //if (/[0-9]/.test(char) && )

  if (/[\[\]{};':"<>,./?!@#$%^&*()\-=+|\\^~`]/.test(char)) {
    e.preventDefault();
  }
  if (char === ',' && value.includes(',')) {
    e.preventDefault();
  }
};

export const handleKeyDownNumberTextFix = (e: any, value: any) => {
  const char = e.key;
  //if (/[0-9]/.test(char) && )

  if (/[\[\]{};':"<>,/?!@#$%^&*()\-=+|\\^~`]/.test(char)) {
    e.preventDefault();
  }
  if (char === ',' && value.includes(',')) {
    e.preventDefault();
  }
};

export const handlePasteFix = (e: any) => {
  const pastedText = e.clipboardData.getData('text');
  if (/[\[\]{};':"<>,/?!@#$%^&*()\-=+|\\^~`]/.test(pastedText)) {
    e.preventDefault();
  }
};


export function isExpired(date: Dayjs | null): boolean | null {
  const d = dayjs(date);
  if (!d.isValid()) return null; // Invalid date format
  const today = dayjs().startOf('day');
  if (d.isBefore(today)) return true;
  return false;
}

/**
 * Lấy filename từ header Content-Disposition
 */
function getFilenameFromContentDisposition(header: string): string {
  // Thử pattern filename*=UTF-8''... hoặc filename="..."
  const utf8Match = /filename\*=UTF-8''(.+)$/.exec(header);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }
  const match = /filename="(.+?)"/.exec(header);
  return match ? match[1] : 'download';
}

/**
 * Tạo link ảo và trigger download trong browser
 */
export function saveBlobAsFile(response: AxiosResponse<Blob>): void {
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  });

  // Lấy filename
  const contentDisposition = response.headers['content-disposition'] ?? '';
  const filename = getFilenameFromContentDisposition(contentDisposition);

  // Tạo object URL
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // Dọn dẹp
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

export const getFileExtension = (fileName) => {
  const fileExtension = fileName.lastIndexOf(".");
  if (fileExtension !== -1) {
    return fileName.slice(fileExtension);
  }
  return "";
};

export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const toSaveDate = (d?: any, format?: string) => (d ? dayjs(d).format(format || 'YYYY-MM-DD') : null);
export const toViewDate = (d?: any, format?: string) => (d ? format ? dayjs(String(d), format): dayjs(d) : null);
export const toViewDateString = (d?: any): string => d ? dayjs(d).format('DD/MM/YYYY') : '';
export const formatName = (hocHam: string | null | undefined, hocVi:  string | null | undefined, tenGoc: string) => 
  [hocHam, hocVi, tenGoc].filter(Boolean).join(". ");


export const getThumbnailUrl = (path: string): string => {

  const lastDotIndex = path?.lastIndexOf(".") ?? -1;
  if (lastDotIndex === -1) {
    console.error("Đường dẫn không có extension hợp lệ");
    return "";
  }

  const filePath = path.substring(0, lastDotIndex);
  const extension = path.substring(lastDotIndex);

  return `${FILE_URL}${filePath}_thumbnail${extension}`;
}

// helpers check permission
export const hasAny = (userPerms: Set<string>, required: string[]) =>
  required.some(p => userPerms.has(p));

export const hasAll = (userPerms: Set<string>, required: string[]) =>
  required.every(p => userPerms.has(p));

export const uiManage = (resource: string) => [
  P.of(resource, 'Create'),
  P.of(resource, 'View'),
  P.of(resource, 'Update'),
  P.of(resource, 'Delete'),
];


export const calcThanhTien = (form: FormInstance<any>, listName: string, rowIndex: number) => {
    const soLuong = form.getFieldValue([listName, rowIndex, 'soLuong']) || 0;
    const donGia = form.getFieldValue([listName, rowIndex, 'donGia']) || 0;

    form.setFieldValue(
      [listName, rowIndex, 'thanhTien'],
      soLuong * donGia
    );
  };

export const calcThanhTienDuocDuyet = (form: FormInstance<any>, listName: string, rowIndex: number) => {
    const soLuong = form.getFieldValue([listName, rowIndex, 'soLuongDuocDuyet']) || 0;
    const donGia = form.getFieldValue([listName, rowIndex, 'donGiaDuocDuyet']) || 0;

    form.setFieldValue(
      [listName, rowIndex, 'thanhTienDuocDuyet'],
      soLuong * donGia
    );
  };

  export const useDynamicCSS = (href: string, id: string) => {
    const [loaded, setLoaded] = useState(false);
  
    useEffect(() => {
      if (document.getElementById(id)) {
        setLoaded(true);
        return;
      }
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      // khi CSS load xong
      link.onload = () => setLoaded(true);
      document.head.appendChild(link);
      return () => {
        const el = document.getElementById(id);
        if (el) document.head.removeChild(el);
      };
    }, [href, id]);
  
    return loaded;
  }

