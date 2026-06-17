# Project Overview
This is the Web Client for the **QLNVKHNew** system (Scientific Task and Capital Management), built with **React 18**, **TypeScript**, and **Vite**. It utilizes the **Metronic** layout and a comprehensive set of libraries for state management, UI, and data visualization.

## Key Technologies
- **UI Frameworks:** React 18, Bootstrap 5, Tailwind CSS, Ant Design.
- **State Management:** Redux Toolkit, Redux Saga, Redux Persist.
- **Routing:** React Router 6/7.
- **Form Handling:** Formik, Yup.
- **API Communication:** Axios with custom shorthand helpers.
- **Charts & Visualization:** ApexCharts, Chart.js, Highcharts.
- **Editors & Grids:** CKEditor 5, Handsontable.
- **Document Viewing:** Syncfusion PDF Viewer.
- **Internationalization:** React Intl.
- **Utilities:** Dayjs, Lodash, UUID, Sanitize-html.
- **Real-time:** Microsoft SignalR.

## Directory Structure
- `src/_metronic`: Metronic theme layout, partials, and helpers.
- `src/app`: Core application logic.
    - `src/app/modules`: Feature-based modules (Auth, Dashboard, Projects, etc.).
    - `src/app/pages`: Page components.
    - `src/app/routing`: Route definitions and private/public route handling.
    - `src/app/components`: Shared components across modules.
- `src/services`: Service layer for API interactions (e.g., `project.service.ts`).
- `src/models`: TypeScript interfaces and classes representing the domain data (e.g., `nhiem-vu.ts`).
- `src/redux`: Global state setup using Redux Toolkit, Sagas, and Persistence.
- `src/hooks`: Custom React hooks (e.g., `useAppConfigs.ts`).
- `src/utils`: Common utilities and the `baseAPI.ts` for request handling.
- `src/types`: Global type definitions.
- `src/data`: Static data and constants.

## Building and Running
This project uses **pnpm** as the package manager.

- **Start Development Server:**
  ```bash
  pnpm dev
  ```
  Runs on `http://localhost:3011` by default.

- **Build for Production:**
  ```bash
  pnpm build
  ```

- **Run Linting:**
  ```bash
  pnpm lint
  ```

- **Preview Production Build:**
  ```bash
  pnpm preview
  ```

## Development Conventions
- **Naming:**
    - Folders: `kebab-case`.
    - Components/Files: `PascalCase`.
    - Hooks: `useCamelCase`.
    - Symbols: Include feature context in names (e.g., `useProjectActions` instead of `useActions`).
- **Imports:** Use the `@` alias for `src` (e.g., `import { ... } from '@/services/project.service'`).
- **API Calls:** Use shorthand helpers from `@/utils/baseAPI` (`requestGET`, `requestPOST`, etc.).
- **Styles:** Prefer Vanilla CSS or Tailwind CSS utility classes. Bootstrap 5 is also available for layout.
- **State:** Use Redux for global state (User, Auth, Global Configs) and local state/Context for component-specific logic.
