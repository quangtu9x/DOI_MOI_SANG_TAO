import { Step } from 'react-joyride';

/**
 * User Guide DTO từ backend
 */
export interface IUserGuide {
  id: string;
  readOnly?: boolean;
  key: string;
  title: string;
  type: string;
  version: number;
  isPublished: boolean;
  locale: string;
  definitionJson: object | string;
  createdOn: string;
  lastModifiedOn?: string;
}


/**
 * Joyride Definition - cấu trúc JSON lưu trong database
 */
export interface JoyrideDefinition {
  steps: Step[];
  options?: JoyrideOptions;
}

/**
 * Joyride Options
 */
export interface JoyrideOptions {
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  disableOverlayClose?: boolean;
  disableCloseOnEsc?: boolean;
  spotlightClicks?: boolean;
  hideBackButton?: boolean;
  locale?: JoyrideLocale;
  styles?: any;
}

/**
 * Joyride Locale (ngôn ngữ cho các nút)
 */
export interface JoyrideLocale {
  back?: string;
  close?: string;
  last?: string;
  next?: string;
  open?: string;
  skip?: string;
}

/**
 * Tham số để lấy user guide
 */
export interface GetUserGuideParams {
  key: string;
  locale?: string;
  type?: string;
}

/**
 * User guide state được lưu trong localStorage
 */
export interface UserGuideState {
  [key: string]: {
    completed: boolean;
    version: number;
    lastViewedAt: string;
  };
}
