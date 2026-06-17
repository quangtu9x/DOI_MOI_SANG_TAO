import { FC, memo, useState, useCallback, useEffect } from 'react';
import JsonView from '@uiw/react-json-view';
import { githubDarkTheme } from '@uiw/react-json-view/githubDark';
import { githubLightTheme } from '@uiw/react-json-view/githubLight';

export interface TDJsonEditorProps {
    value?: string | object;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    theme?: 'light' | 'dark';
    placeholder?: string;
    height?: string | number;
    indentWidth?: number;
    onError?: (error: Error) => void;
    showEditor?: boolean; // Toggle between editor and viewer
}

const TDJsonEditor: FC<TDJsonEditorProps> = memo(({
    value,
    onChange,
    readOnly = false,
    theme = 'light',
    placeholder = '{}',
    height = 400,
    indentWidth = 2,
    onError,
    showEditor = false,
}) => {
    // State for editor mode
    const [isEditorMode, setIsEditorMode] = useState(showEditor);
    const [jsonString, setJsonString] = useState<string>(() => {
        if (!value) return placeholder;

        try {
            if (typeof value === 'string') {
                // Validate and reformat
                const parsed = JSON.parse(value);
                return JSON.stringify(parsed, null, indentWidth);
            }
            return JSON.stringify(value, null, indentWidth);
        } catch (error) {
            console.error('JSON parse error:', error);
            onError?.(error as Error);
            return placeholder;
        }
    });

    const [parsedValue, setParsedValue] = useState<object>(() => {
        try {
            return JSON.parse(jsonString);
        } catch {
            return {};
        }
    });

    // Update when value prop changes
    useEffect(() => {
        if (!value) {
            setJsonString(placeholder);
            setParsedValue({});
            return;
        }

        try {
            if (typeof value === 'string') {
                const parsed = JSON.parse(value);
                setJsonString(JSON.stringify(parsed, null, indentWidth));
                setParsedValue(parsed);
            } else {
                setJsonString(JSON.stringify(value, null, indentWidth));
                setParsedValue(value);
            }
        } catch (error) {
            console.error('JSON parse error:', error);
            onError?.(error as Error);
        }
    }, [value, indentWidth, placeholder, onError]);

    // Handle textarea change
    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setJsonString(newValue);

        if (!readOnly && onChange) {
            try {
                // Validate and parse JSON
                const parsed = JSON.parse(newValue);
                setParsedValue(parsed);
                onChange(newValue);
            } catch (error) {
                // Invalid JSON - don't update parsedValue or call onChange
                console.debug('Invalid JSON (editing in progress)');
            }
        }
    }, [onChange, readOnly]);

    // Toggle between editor and viewer
    const toggleMode = useCallback(() => {
        setIsEditorMode(prev => !prev);
    }, []);

    const selectedTheme = theme === 'dark' ? githubDarkTheme : githubLightTheme;

    return (
        <div className="td-json-editor-editable">
            {!readOnly && (
                <div className="mb-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={toggleMode}
                    >
                        {isEditorMode ? '👁️ Xem' : '✏️ Sửa'}
                    </button>
                </div>
            )}

            <div
                style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    overflow: 'auto',
                    height: typeof height === 'number' ? `${height}px` : height,
                }}
            >
                {isEditorMode ? (
                    <textarea
                        value={jsonString}
                        onChange={handleTextareaChange}
                        readOnly={readOnly}
                        placeholder={placeholder}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            padding: '12px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            resize: 'none',
                            backgroundColor: theme === 'dark' ? '#0d1117' : '#fff',
                            color: theme === 'dark' ? '#c9d1d9' : '#24292e',
                        }}
                    />
                ) : (
                    <JsonView
                        value={parsedValue}
                        style={selectedTheme}
                        collapsed={1}
                        displayDataTypes={true}
                        displayObjectSize={true}
                        enableClipboard={true}
                    />
                )}
            </div>
        </div>
    );
});

TDJsonEditor.displayName = 'TDJsonEditor';

export default TDJsonEditor;
