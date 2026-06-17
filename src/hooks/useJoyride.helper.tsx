import React from 'react';
import { Step } from 'react-joyride';

/**
 * Component để render HTML content an toàn
 */
export const HtmlContent: React.FC<{ html: string }> = ({ html }) => (
    <div dangerouslySetInnerHTML={{ __html: html }} />
);

/**
 * Convert content thành React Element nếu là HTML string
 */
export const processStepContent = (step: Step): Step => {
    if (typeof step.content === 'string' && step.content.includes('<')) {
        // Nếu content chứa HTML tags, convert thành React Element
        return {
            ...step,
            content: <HtmlContent html={step.content} />
        };
    }
    return step;
};
