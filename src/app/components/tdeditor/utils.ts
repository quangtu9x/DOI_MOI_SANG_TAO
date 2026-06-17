import sanitizeHtml from 'sanitize-html';
import { sanitizeConfig } from './config';
import type { SanitizeConfig } from './types';

export const sanitizeContent = (content: string, options: SanitizeConfig = sanitizeConfig): string => {
  try {
    return sanitizeHtml(content, options);
  } catch (error) {
    console.error('Sanitize error:', error);
    return content;
  }
};

export const validateContent = (content: string, options: SanitizeConfig = sanitizeConfig): boolean => {
  try {
    const sanitized = sanitizeHtml(content, options);
    return sanitized === content;
  } catch {
    return false;
  }
};

export const stripAllHtml = (content: string): string => {
  return sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
};
