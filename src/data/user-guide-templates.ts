/**
 * Common Tour Definitions
 * 
 * File này chứa các mẫu tour phổ biến có thể sử dụng làm template
 * khi tạo user guide trong backend
 */

/**
 * DASHBOARD TOUR
 * Hướng dẫn sử dụng Dashboard
 */
export const DASHBOARD_TOUR = {
  key: 'dashboard-tour',
  title: 'Hướng dẫn Dashboard',
  type: 'onboarding',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: 'body',
        content: '<div style="text-align: center;"><h2>🎉 Chào mừng đến Dashboard!</h2><p>Hãy cùng khám phá các tính năng chính</p></div>',
        placement: 'center',
        disableBeacon: true
      },
      {
        target: '[data-tour="statistics"]',
        content: 'Xem các chỉ số thống kê tổng quan tại đây',
        title: '📊 Thống kê',
        placement: 'bottom'
      },
      {
        target: '[data-tour="charts"]',
        content: 'Biểu đồ hiển thị xu hướng và phân tích dữ liệu',
        title: '📈 Biểu đồ',
        placement: 'top'
      },
      {
        target: '[data-tour="quick-actions"]',
        content: 'Các thao tác nhanh thường dùng',
        title: '⚡ Thao tác nhanh',
        placement: 'left'
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      showSkipButton: true
    }
  }
};

/**
 * DATA MANAGEMENT TOUR
 * Hướng dẫn quản lý dữ liệu
 */
export const DATA_MANAGEMENT_TOUR = {
  key: 'data-management-tour',
  title: 'Hướng dẫn quản lý dữ liệu',
  type: 'feature',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: '[data-tour="search-box"]',
        content: 'Tìm kiếm dữ liệu theo từ khóa',
        title: '🔍 Tìm kiếm',
        placement: 'bottom'
      },
      {
        target: '[data-tour="filter-button"]',
        content: 'Mở bộ lọc nâng cao để tìm kiếm chính xác hơn',
        title: '🎯 Bộ lọc',
        placement: 'bottom'
      },
      {
        target: '[data-tour="create-button"]',
        content: 'Click vào đây để tạo mới bản ghi',
        title: '➕ Tạo mới',
        placement: 'left',
        spotlightClicks: true
      },
      {
        target: '[data-tour="export-button"]',
        content: 'Xuất dữ liệu ra file Excel hoặc PDF',
        title: '📊 Xuất dữ liệu',
        placement: 'left'
      },
      {
        target: '[data-tour="data-table"]',
        content: 'Click vào dòng để xem chi tiết hoặc chỉnh sửa',
        title: '📋 Bảng dữ liệu',
        placement: 'top'
      },
      {
        target: '[data-tour="pagination"]',
        content: 'Điều hướng giữa các trang',
        title: '📄 Phân trang',
        placement: 'top'
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      showSkipButton: true
    }
  }
};

/**
 * USER PROFILE TOUR
 * Hướng dẫn quản lý hồ sơ cá nhân
 */
export const USER_PROFILE_TOUR = {
  key: 'user-profile-tour',
  title: 'Hướng dẫn hồ sơ cá nhân',
  type: 'feature',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: '[data-tour="profile-avatar"]',
        content: 'Click vào để thay đổi ảnh đại diện',
        title: '👤 Ảnh đại diện',
        placement: 'right'
      },
      {
        target: '[data-tour="profile-info"]',
        content: 'Cập nhật thông tin cá nhân của bạn',
        title: 'ℹ️ Thông tin cá nhân',
        placement: 'left'
      },
      {
        target: '[data-tour="change-password"]',
        content: 'Thay đổi mật khẩu để bảo mật tài khoản',
        title: '🔒 Đổi mật khẩu',
        placement: 'left'
      },
      {
        target: '[data-tour="notification-settings"]',
        content: 'Tùy chỉnh thông báo theo ý muốn',
        title: '🔔 Cài đặt thông báo',
        placement: 'left'
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      showSkipButton: true
    }
  }
};

/**
 * SETTINGS TOUR
 * Hướng dẫn cài đặt hệ thống
 */
export const SETTINGS_TOUR = {
  key: 'settings-tour',
  title: 'Hướng dẫn cài đặt',
  type: 'feature',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: '[data-tour="general-settings"]',
        content: 'Cài đặt chung của hệ thống',
        title: '⚙️ Cài đặt chung',
        placement: 'right'
      },
      {
        target: '[data-tour="appearance-settings"]',
        content: 'Tùy chỉnh giao diện (theme, ngôn ngữ...)',
        title: '🎨 Giao diện',
        placement: 'right'
      },
      {
        target: '[data-tour="security-settings"]',
        content: 'Cấu hình bảo mật và quyền truy cập',
        title: '🔐 Bảo mật',
        placement: 'right'
      },
      {
        target: '[data-tour="integration-settings"]',
        content: 'Tích hợp với các dịch vụ bên ngoài',
        title: '🔗 Tích hợp',
        placement: 'right'
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      showSkipButton: true
    }
  }
};

/**
 * INTERACTIVE TUTORIAL
 * Hướng dẫn tương tác - người dùng phải thực hiện các bước
 */
export const INTERACTIVE_TUTORIAL = {
  key: 'interactive-tutorial',
  title: 'Hướng dẫn tạo bản ghi đầu tiên',
  type: 'tutorial',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: 'body',
        content: '<h2>Hướng dẫn tạo bản ghi</h2><p>Hãy thực hiện theo các bước sau</p>',
        placement: 'center',
        disableBeacon: true
      },
      {
        target: '[data-tour="create-button"]',
        content: 'Bước 1: Click vào nút này để mở form',
        title: '1️⃣ Mở form',
        placement: 'bottom',
        spotlightClicks: true,
        hideFooter: true,
        disableOverlayClose: true
      },
      {
        target: '[data-tour="input-name"]',
        content: 'Bước 2: Nhập tên vào đây',
        title: '2️⃣ Nhập tên',
        placement: 'top'
      },
      {
        target: '[data-tour="input-description"]',
        content: 'Bước 3: Nhập mô tả',
        title: '3️⃣ Nhập mô tả',
        placement: 'top'
      },
      {
        target: '[data-tour="submit-button"]',
        content: 'Bước 4: Click Lưu để hoàn thành',
        title: '4️⃣ Lưu',
        placement: 'top',
        spotlightClicks: true
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      disableCloseOnEsc: true,
      disableOverlayClose: true
    }
  }
};

/**
 * WELCOME TOUR
 * Tour chào mừng người dùng mới
 */
export const WELCOME_TOUR = {
  key: 'welcome-tour',
  title: 'Chào mừng bạn đến với hệ thống',
  type: 'onboarding',
  locale: 'vi',
  definitionJson: {
    steps: [
      {
        target: 'body',
        content: '<div style="text-align: center;"><h1>👋 Chào mừng!</h1><p>Cảm ơn bạn đã tham gia hệ thống của chúng tôi</p></div>',
        placement: 'center',
        disableBeacon: true
      },
      {
        target: '[data-tour="sidebar"]',
        content: 'Menu điều hướng chính - truy cập tất cả các chức năng tại đây',
        title: '📱 Menu',
        placement: 'right'
      },
      {
        target: '[data-tour="notifications"]',
        content: 'Kiểm tra thông báo và cập nhật mới nhất',
        title: '🔔 Thông báo',
        placement: 'bottom-end'
      },
      {
        target: '[data-tour="user-menu"]',
        content: 'Quản lý tài khoản và cài đặt cá nhân',
        title: '👤 Tài khoản',
        placement: 'bottom-end'
      },
      {
        target: '[data-tour="help-button"]',
        content: 'Cần trợ giúp? Click vào đây bất cứ lúc nào',
        title: '❓ Trợ giúp',
        placement: 'left'
      },
      {
        target: 'body',
        content: '<div style="text-align: center;"><h2>✨ Sẵn sàng!</h2><p>Bạn đã sẵn sàng sử dụng hệ thống. Chúc bạn làm việc hiệu quả!</p></div>',
        placement: 'center'
      }
    ],
    options: {
      continuous: true,
      showProgress: true,
      showSkipButton: false,
      hideBackButton: false
    }
  }
};

/**
 * Hàm helper để tạo tour definition cho API
 */
export const createTourDefinition = (
  key: string,
  title: string,
  steps: any[],
  options?: {
    type?: string;
    locale?: string;
    version?: number;
    isPublished?: boolean;
    tourOptions?: any;
  }
) => {
  return {
    key,
    title,
    type: options?.type || 'onboarding',
    locale: options?.locale || 'vi',
    version: options?.version || 1,
    isPublished: options?.isPublished !== false,
    definitionJson: JSON.stringify({
      steps,
      options: options?.tourOptions || {
        continuous: true,
        showProgress: true,
        showSkipButton: true
      }
    })
  };
};

/**
 * Export tất cả tours
 */
export const COMMON_TOURS = {
  DASHBOARD_TOUR,
  DATA_MANAGEMENT_TOUR,
  USER_PROFILE_TOUR,
  SETTINGS_TOUR,
  INTERACTIVE_TUTORIAL,
  WELCOME_TOUR
};

export default COMMON_TOURS;
