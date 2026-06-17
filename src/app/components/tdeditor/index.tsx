import { FC, memo, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import sanitizeHtml from 'sanitize-html';
import { requestUploadFile } from '@/utils/baseAPI';
import { FILE_URL } from '@/utils/baseAPI';
import { editorConfig, sanitizeConfig } from './config';
import type { UploadAdapter, FileLoader, SanitizeConfig } from './types';

import 'ckeditor5/ckeditor5.css';
import { ClassicEditor, EditorConfig } from 'ckeditor5';

interface TDEditorProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  sanitizeOptions?: SanitizeConfig;
}

const createUploadAdapter = (loader: FileLoader): UploadAdapter => {
  return {
    upload: async () => {
      try {
        const file = await loader.file;
        const formData = new FormData();
        formData.append('files', file);

        const response = await requestUploadFile<{ data: { url: string }[] }>('attachments', formData);
        if (response.status === 200 && response.data?.data?.[0]?.url) {
          return {
            default: `${FILE_URL}${response.data.data[0].url}`,
          };
        }
        throw new Error('Upload failed');
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    },
    abort: () => {
      // Implement abort logic if needed
    },
  };
};

function uploadPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = loader => {
    return createUploadAdapter(loader);
  };
}

const TDEditor: FC<TDEditorProps> = memo(({ data, onChange, placeholder = '', readOnly = false, sanitizeOptions = sanitizeConfig }) => {
  const config = useMemo(
    (): EditorConfig => ({
      ...editorConfig,
      extraPlugins: [uploadPlugin],
      placeholder,
    }),
    [placeholder]
  );

  const handleChange = (_, editor: ClassicEditor) => {
    const content = editor.getData();
    console.log('Editor content:', content);
    const sanitizedContent = sanitizeHtml(content, sanitizeOptions);
    console.log('Sanitized content:', sanitizedContent);
    onChange(sanitizedContent);
  };

  const sanitizedInitialData = useMemo(() => sanitizeHtml(data, sanitizeOptions), [sanitizeOptions]);

  return (
    <CKEditor
      editor={ClassicEditor}
      config={config}
      data={sanitizedInitialData}
      onChange={handleChange}
      disabled={readOnly} />
  );
});

TDEditor.displayName = 'TDEditor';

export default TDEditor;
