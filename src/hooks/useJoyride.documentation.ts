/**
 * ============================================================================
 * USEJORIDE HOOK - HƯỚNG DẪN SỬ DỤNG ĐẦY ĐỦ
 * ============================================================================
 * 
 * Hook này tích hợp với backend để lấy và quản lý user guide tours
 * sử dụng thư viện react-joyride
 */

// ============================================================================
// 1. CẤU TRÚC DỮ LIỆU BACKEND
// ============================================================================

/**
 * Cấu trúc JSON lưu trong trường DefinitionJson của bảng UserGuide
 * 
 * Backend endpoint: GET /api/public/v1/user-guides/published/{key}?locale=vi&type=onboarding
 */

// Ví dụ DefinitionJson đầy đủ:
const exampleDefinitionJson = {
  "steps": [
    {
      "target": ".dashboard-header",
      "content": "Đây là khu vực header của dashboard. Bạn có thể xem thông tin tổng quan tại đây.",
      "title": "Chào mừng đến với Dashboard",
      "placement": "bottom",
      "disableBeacon": true
    },
    {
      "target": "#sidebar-menu",
      "content": "Menu điều hướng giúp bạn truy cập nhanh các chức năng chính.",
      "title": "Menu điều hướng",
      "placement": "right",
      "disableBeacon": false
    },
    {
      "target": "[data-tour='create-button']",
      "content": "Click vào đây để tạo mới một bản ghi.",
      "title": "Tạo mới",
      "placement": "bottom",
      "spotlightClicks": true
    },
    {
      "target": ".notification-icon",
      "content": "Kiểm tra thông báo của bạn tại đây.",
      "title": "Thông báo",
      "placement": "bottom-end"
    }
  ],
  "options": {
    "continuous": true,
    "showProgress": true,
    "showSkipButton": true,
    "disableOverlayClose": false,
    "disableCloseOnEsc": false,
    "spotlightClicks": false,
    "hideBackButton": false,
    "locale": {
      "back": "Quay lại",
      "close": "Đóng",
      "last": "Hoàn thành",
      "next": "Tiếp theo",
      "skip": "Bỏ qua"
    }
  }
};

// ============================================================================
// 2. CÁC LOẠI TARGET SELECTOR
// ============================================================================

/**
 * Target có thể là:
 * - CSS class: ".my-class"
 * - ID: "#my-id"
 * - Data attribute: "[data-tour='step-1']"
 * - Element tag: "button", "div"
 * - Compound: "div.class-name#id-name"
 */

const targetExamples = {
  "steps": [
    {
      "target": ".btn-primary",              // CSS class
      "content": "Nút chính"
    },
    {
      "target": "#user-profile",             // ID
      "content": "Thông tin người dùng"
    },
    {
      "target": "[data-tour='widget-1']",    // Data attribute (RECOMMENDED)
      "content": "Widget đầu tiên"
    },
    {
      "target": "body",                      // Element tag
      "content": "Bước đầu tiên",
      "placement": "center"                  // Center cho body
    }
  ]
};

// ============================================================================
// 3. PLACEMENT OPTIONS
// ============================================================================

/**
 * Vị trí hiển thị tooltip:
 * - top, top-start, top-end
 * - bottom, bottom-start, bottom-end
 * - left, left-start, left-end
 * - right, right-start, right-end
 * - auto (tự động chọn vị trí tốt nhất)
 * - center (chỉ dùng cho body)
 */

const placementExamples = {
  "steps": [
    {
      "target": ".header",
      "content": "Header",
      "placement": "bottom"
    },
    {
      "target": ".sidebar",
      "content": "Sidebar",
      "placement": "right"
    },
    {
      "target": ".footer",
      "content": "Footer",
      "placement": "top"
    },
    {
      "target": "body",
      "content": "Màn hình chào mừng",
      "placement": "center"
    }
  ]
};

// ============================================================================
// 4. STEP PROPERTIES ĐẦY ĐỦ
// ============================================================================

const fullStepExample = {
  "steps": [
    {
      // REQUIRED
      "target": ".my-element",               // CSS selector
      "content": "Nội dung hướng dẫn",       // Text hoặc HTML

      // OPTIONAL
      "title": "Tiêu đề bước",               // Tiêu đề
      "placement": "bottom",                 // Vị trí tooltip
      "disableBeacon": false,                // Tắt beacon (chấm nhấp nháy)
      "spotlightClicks": false,              // Cho phép click vào element
      "hideCloseButton": false,              // Ẩn nút close
      "hideFooter": false,                   // Ẩn footer (next, back buttons)
      "isFixed": false,                      // Element có position: fixed không
      "offset": 10,                          // Khoảng cách từ target (pixels)
      "placementBeacon": "top",              // Vị trí beacon
      "disableOverlayClose": false,          // Tắt click overlay để đóng
      "locale": {                            // Override locale cho step này
        "next": "Tiếp tục",
        "back": "Trở về"
      },
      "styles": {                            // Custom styles cho step này
        "tooltip": {
          "backgroundColor": "#fff"
        }
      }
    }
  ]
};

// ============================================================================
// 5. VÍ DỤ CÁC LOẠI TOUR PHỔ BIẾN
// ============================================================================

// 5.1. Onboarding Tour (Hướng dẫn người dùng mới)
const onboardingTour = {
  "steps": [
    {
      "target": "body",
      "content": "<h2>Chào mừng bạn đến với hệ thống!</h2><p>Hãy cùng khám phá các tính năng chính.</p>",
      "placement": "center",
      "disableBeacon": true,
      "locale": {
        "next": "Bắt đầu"
      }
    },
    {
      "target": ".dashboard-widgets",
      "content": "Đây là các widget hiển thị thông tin tổng quan.",
      "title": "Dashboard Widgets",
      "placement": "bottom"
    },
    {
      "target": ".user-menu",
      "content": "Quản lý tài khoản và cài đặt cá nhân của bạn.",
      "title": "Menu người dùng",
      "placement": "bottom-end"
    },
    {
      "target": "body",
      "content": "<h3>Hoàn thành!</h3><p>Bạn đã sẵn sàng sử dụng hệ thống.</p>",
      "placement": "center",
      "locale": {
        "last": "Bắt đầu sử dụng"
      }
    }
  ],
  "options": {
    "continuous": true,
    "showProgress": true,
    "showSkipButton": true
  }
};

// 5.2. Feature Tour (Giới thiệu tính năng mới)
const featureTour = {
  "steps": [
    {
      "target": ".new-feature-badge",
      "content": "Chúng tôi vừa thêm tính năng mới! Hãy cùng khám phá.",
      "title": "Tính năng mới",
      "placement": "bottom",
      "disableBeacon": true
    },
    {
      "target": "[data-tour='export-button']",
      "content": "Bạn có thể xuất dữ liệu ra Excel hoặc PDF.",
      "title": "Xuất dữ liệu",
      "placement": "left"
    },
    {
      "target": "[data-tour='filter-panel']",
      "content": "Bộ lọc nâng cao giúp tìm kiếm chính xác hơn.",
      "title": "Bộ lọc nâng cao",
      "placement": "right"
    }
  ],
  "options": {
    "continuous": true,
    "showSkipButton": true,
    "hideBackButton": true
  }
};

// 5.3. Interactive Tutorial (Hướng dẫn tương tác)
const interactiveTutorial = {
  "steps": [
    {
      "target": "body",
      "content": "Hãy thực hiện theo các bước sau để tạo bản ghi đầu tiên.",
      "title": "Hướng dẫn tạo bản ghi",
      "placement": "center",
      "disableBeacon": true
    },
    {
      "target": ".btn-create",
      "content": "Bước 1: Click vào nút này để mở form.",
      "title": "Mở form tạo mới",
      "placement": "bottom",
      "spotlightClicks": true,              // Cho phép click
      "disableOverlayClose": true,          // Không đóng khi click overlay
      "hideFooter": true                    // Ẩn nút next (user phải click)
    },
    {
      "target": "#input-name",
      "content": "Bước 2: Nhập tên vào đây.",
      "title": "Nhập tên",
      "placement": "top"
    },
    {
      "target": ".btn-submit",
      "content": "Bước 3: Click Lưu để hoàn thành.",
      "title": "Lưu dữ liệu",
      "placement": "top",
      "spotlightClicks": true
    }
  ],
  "options": {
    "continuous": true,
    "disableCloseOnEsc": true,
    "disableOverlayClose": true
  }
};

// ============================================================================
// 6. CÁC TRƯỜNG HỢP THỰC TÊ TRONG DỰ ÁN
// ============================================================================

// 6.1. Dashboard Tour
const dashboardTourJson = {
  "steps": [
    {
      "target": "body",
      "content": "<div style='text-align: center;'><h2>🎉 Chào mừng đến Dashboard</h2><p>Hãy cùng khám phá các chức năng chính</p></div>",
      "placement": "center",
      "disableBeacon": true
    },
    {
      "target": "[data-tour='statistics-card']",
      "content": "Xem các chỉ số thống kê tổng quan tại đây",
      "title": "Thống kê",
      "placement": "bottom"
    },
    {
      "target": "[data-tour='chart-area']",
      "content": "Biểu đồ hiển thị xu hướng theo thời gian",
      "title": "Biểu đồ",
      "placement": "top"
    },
    {
      "target": "[data-tour='quick-actions']",
      "content": "Các thao tác nhanh thường dùng",
      "title": "Thao tác nhanh",
      "placement": "left"
    }
  ]
};

// 6.2. Data Entry Tour
const dataEntryTourJson = {
  "steps": [
    {
      "target": "[data-tour='search-box']",
      "content": "Tìm kiếm dữ liệu theo từ khóa",
      "title": "Tìm kiếm",
      "placement": "bottom"
    },
    {
      "target": "[data-tour='filter-button']",
      "content": "Mở bộ lọc nâng cao",
      "title": "Bộ lọc",
      "placement": "bottom"
    },
    {
      "target": "[data-tour='create-button']",
      "content": "Tạo mới bản ghi",
      "title": "Tạo mới",
      "placement": "left"
    },
    {
      "target": "[data-tour='export-button']",
      "content": "Xuất dữ liệu ra file Excel",
      "title": "Xuất dữ liệu",
      "placement": "left"
    },
    {
      "target": "[data-tour='data-table']",
      "content": "Bảng dữ liệu chính. Click vào dòng để xem chi tiết.",
      "title": "Bảng dữ liệu",
      "placement": "top"
    }
  ]
};

// ============================================================================
// 7. CÁCH TẠO USER GUIDE TRONG DATABASE
// ============================================================================

/**
 * SQL Script để tạo user guide mẫu:
 * 
 * INSERT INTO UserGuides (Id, Key, Title, Type, Version, IsPublished, Locale, DefinitionJson, CreatedOn)
 * VALUES (
 *   NEWID(),
 *   'dashboard-tour',
 *   'Hướng dẫn Dashboard',
 *   'onboarding',
 *   1,
 *   1,
 *   'vi',
 *   '{"steps":[{"target":"body","content":"Chào mừng!","placement":"center"}],"options":{"continuous":true}}',
 *   GETDATE()
 * );
 */

// Hoặc sử dụng API:
const createUserGuideRequest = {
  "method": "POST",
  "url": "/api/v1/user-guides",
  "headers": {
    "Authorization": "Bearer {token}",
    "Content-Type": "application/json"
  },
  "body": {
    "key": "dashboard-tour",
    "title": "Hướng dẫn Dashboard",
    "type": "onboarding",
    "version": 1,
    "isPublished": true,
    "locale": "vi",
    "definitionJson": JSON.stringify(dashboardTourJson)
  }
};

// ============================================================================
// 8. BEST PRACTICES
// ============================================================================

/**
 * 1. Sử dụng data-tour attribute cho target:
 *    <div data-tour="step-1">Content</div>
 *    Target: "[data-tour='step-1']"
 * 
 * 2. Giữ các bước ngắn gọn (3-7 bước tối ưu)
 * 
 * 3. Luôn có bước đầu và bước cuối ở center
 * 
 * 4. Sử dụng title cho mỗi bước
 * 
 * 5. Test tour trên nhiều kích thước màn hình
 * 
 * 6. Version tăng dần khi update tour (để hiện lại cho user đã xem)
 * 
 * 7. Sử dụng HTML trong content khi cần format phức tạp
 * 
 * 8. Đặt locale phù hợp với ngôn ngữ người dùng
 */

// ============================================================================
// 9. TROUBLESHOOTING
// ============================================================================

/**
 * Q: Tour không hiển thị?
 * A: Kiểm tra:
 *    - Element target có tồn tại trong DOM không
 *    - CSS selector có đúng không
 *    - IsPublished = true trong database
 *    - Locale và Type có match không
 * 
 * Q: Tooltip hiển thị sai vị trí?
 * A: Thử đổi placement hoặc dùng "auto"
 * 
 * Q: Không click được vào element trong tour?
 * A: Set "spotlightClicks": true cho step đó
 * 
 * Q: Tour bị đóng khi click overlay?
 * A: Set "disableOverlayClose": true
 * 
 * Q: Muốn tour tự động chạy lại khi có version mới?
 * A: Tăng version trong database, hook sẽ tự động detect
 */

// ============================================================================
// 10. API ENDPOINTS
// ============================================================================

/**
 * GET /api/public/v1/user-guides/published/{key}?locale=vi&type=onboarding
 * - Lấy user guide đã publish (không cần authentication)
 * - Params:
 *   + key (required): unique key của guide
 *   + locale (optional): ngôn ngữ, default "vi"
 *   + type (optional): loại guide, default "onboarding"
 * 
 * GET /api/v1/user-guides/{id}
 * - Lấy chi tiết user guide (cần authentication)
 * 
 * POST /api/v1/user-guides/search
 * - Tìm kiếm danh sách user guides (cần authentication)
 * 
 * POST /api/v1/user-guides
 * - Tạo mới user guide (cần permission)
 * 
 * PUT /api/v1/user-guides/{id}
 * - Cập nhật user guide (cần permission)
 * 
 * DELETE /api/v1/user-guides/{id}
 * - Xóa user guide (cần permission)
 */

export {};
