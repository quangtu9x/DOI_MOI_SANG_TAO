import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Form, Input } from 'antd';
import type { InputRef } from 'antd';

interface AutoResizeInputProps {
    fullAddress: string;
    street?: string;
    value?: string; // Support controlled component
    onChange?: (value: string) => void; // Callback when value changes
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    minWidth?: number;
    maxWidth?: number;
}

export interface AutoResizeInputRef {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
}

const TDAutoResizeInput = forwardRef<AutoResizeInputRef, AutoResizeInputProps>(({
    fullAddress,
    street = '',
    value,
    onChange,
    placeholder = "",
    disabled = false,
    className = "",
    style = {},
    minWidth = 100,
    maxWidth = 400
}, ref) => {
    // Support both controlled and uncontrolled modes
    const [internalValue, setInternalValue] = useState<string>(value ?? street);
    const currentValue = value !== undefined ? value : internalValue;

    const [inputWidth, setInputWidth] = useState<string>('auto');
    const firstInputRef = useRef<InputRef>(null);
    const hiddenSpanRef = useRef<HTMLSpanElement>(null);
    const measureTimeoutRef = useRef<NodeJS.Timeout>();

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        focus: () => firstInputRef.current?.focus(),
        blur: () => firstInputRef.current?.blur(),
        getValue: () => currentValue,
        setValue: (newValue: string) => {
            if (value === undefined) {
                setInternalValue(newValue);
            }
            onChange?.(newValue);
        }
    }), [currentValue, value, onChange]);

    // Optimized width calculation with memoization
    const calculateWidth = useCallback(() => {
        if (!hiddenSpanRef.current || !firstInputRef.current?.input) return;

        const input = firstInputRef.current.input;
        const span = hiddenSpanRef.current;
        const computedStyle = window.getComputedStyle(input);

        // Apply input styles to measurement span
        span.style.fontSize = computedStyle.fontSize;
        span.style.fontFamily = computedStyle.fontFamily;
        span.style.fontWeight = computedStyle.fontWeight;
        span.style.letterSpacing = computedStyle.letterSpacing;
        span.style.padding = computedStyle.padding;
        span.style.border = computedStyle.border;

        const contentWidth = span.offsetWidth;
        const paddingAndBorder =
            parseFloat(computedStyle.paddingLeft) +
            parseFloat(computedStyle.paddingRight) +
            parseFloat(computedStyle.borderLeftWidth) +
            parseFloat(computedStyle.borderRightWidth);

        const totalWidth = contentWidth + paddingAndBorder + 20; // Extra padding for cursor
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, totalWidth));

        setInputWidth(`${constrainedWidth}px`);
    }, [minWidth, maxWidth]);

    // Debounced width calculation
    useEffect(() => {
        if (measureTimeoutRef.current) {
            clearTimeout(measureTimeoutRef.current);
        }

        measureTimeoutRef.current = setTimeout(calculateWidth, 50);

        return () => {
            if (measureTimeoutRef.current) {
                clearTimeout(measureTimeoutRef.current);
            }
        };
    }, [currentValue, calculateWidth]);

    // Sync with external value prop
    useEffect(() => {
        if (value !== undefined && value !== internalValue) {
            setInternalValue(value);
        }
    }, [value, internalValue]);

    // Handle value change
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (value === undefined) {
            setInternalValue(newValue);
        }

        onChange?.(newValue);
    }, [value, onChange]);

    // Enhanced keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            firstInputRef.current?.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // Allow parent to handle enter key
        }
    }, []);

    const handleSecondInputFocus = useCallback(() => {
        firstInputRef.current?.focus();
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (measureTimeoutRef.current) {
                clearTimeout(measureTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`col-xl-12 col-lg-12 ${className}`} style={style}>
            <Form.Item
                label="Địa chỉ cụ thể"
                name="address"
                rules={[
                    {
                        pattern: /^[a-zA-Z0-9\sÀ-ỹ\,\.\/+-]*$/,
                        message: "Không được nhập các ký tự đặc biệt!"
                    },
                    {
                        required: true,
                        message: "Không được để trống!"
                    },
                ]}
            >
                <div className="d-flex align-items-center position-relative">
                    {/* Hidden measurement span - more accurate measurement */}
                    <span
                        ref={hiddenSpanRef}
                        className="position-absolute"
                        style={{
                            visibility: 'hidden',
                            whiteSpace: 'pre',
                            height: '0',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            top: 0,
                            left: 0,
                            zIndex: -1,
                        }}
                        aria-hidden="true"
                    >
                        {currentValue || placeholder || ' '}
                    </span>

                    {/* Auto-resize input */}
                    <Input
                        ref={firstInputRef}
                        style={{
                            width: inputWidth,
                            flexShrink: 0,
                            borderRight: 'none',
                            borderTopRightRadius: 0,
                            borderBottomRightRadius: 0,
                            transition: 'width 0.2s ease-in-out',
                        }}
                        className="first-input"
                        placeholder={placeholder}
                        value={currentValue}
                        onChange={handleChange}
                        disabled={disabled}
                        onPressEnter={() => { }} // Prevent form submission
                    />

                    {/* Combined readonly input for full address */}
                    <Input
                        style={{
                            flex: 1,
                            backgroundColor: disabled ? '#f5f5f5' : '#f8f9fa',
                            borderLeft: 'none',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            cursor: disabled ? 'not-allowed' : 'text',
                        }}
                        onFocus={handleSecondInputFocus}
                        onKeyDown={handleKeyDown}
                        className="second-input"
                        readOnly
                        disabled={disabled}
                        value={fullAddress}
                        title={fullAddress} // Tooltip for full address
                    />
                </div>
            </Form.Item>
        </div>
    );
});

TDAutoResizeInput.displayName = 'TDAutoResizeInput';

export default TDAutoResizeInput;

