import { IOptions } from 'sanitize-html';

export interface FileLoader {
  file: Promise<File>;
}

export interface UploadAdapter {
  upload: () => Promise<{ default: string }>;
  abort: () => void;
}
/* 
export interface EditorConfig {
  plugins: unknown[];
  toolbar: {
    items: string[];
    shouldNotGroupWhenFull: boolean;
  };
  extraPlugins?: unknown[];
  placeholder?: string;
  readOnly?: boolean;
  fontFamily?: {
    supportAllValues: boolean;
  };
  fontSize?: {
    options: (number | string)[];
    supportAllValues: boolean;
  };
  heading?: {
    options: Array<{
      model: string;
      title: string;
      class: string;
      view?: string;
    }>;
  };
  htmlSupport?: {
    allow: Array<{
      name: unknown;
      styles: boolean;
      attributes: boolean;
      classes: boolean;
    }>;
  };
  image?: {
    toolbar: string[];
  };
  initialData?: string;
  link?: {
    addTargetToExternalLinks: boolean;
    defaultProtocol: string;
    decorators: {
      toggleDownloadable: {
        mode: string;
        label: string;
        attributes: Record<string, string>;
      };
    };
  };
  style?: {
    definitions: Array<{
      name: string;
      element: string;
      classes: string[];
    }>;
  };
  table?: {
    contentToolbar: string[];
  };
} */

export interface UploadResponse {
  data: {
    url: string;
  }[];
}

export type SanitizeConfig = IOptions;
