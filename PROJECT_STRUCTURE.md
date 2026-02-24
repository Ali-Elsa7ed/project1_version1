# 📂 Project Structure Documentation

## Overview
This document provides a detailed explanation of the HAYARCO project structure and file organization.

## Directory Structure

```
جعفر العمدة 2/
│
├── 📁 src/                          # Source code directory
│   │
│   ├── 📁 locales/                  # Translation files (i18n)
│   │   ├── 📄 ar.js                # Arabic translations
│   │   ├── 📄 en.js                # English translations
│   │   └── 📄 index.js             # Translations export file
│   │
│   ├── 📁 data/                     # Initial data and constants
│   │   └── 📄 initialData.js       # Default users, expenses, departments
│   │
│   ├── 📄 App.jsx                   # Main application component
│   ├── 📄 index.css                 # Global styles and CSS variables
│   └── 📄 main.jsx                  # Application entry point
│
├── 📁 public/                       # Public static files
│   ├── 🖼️ logo.png                  # Company logo
│   └── 🖼️ background.jpg            # Background image
│
├── 📄 index.html                    # HTML template
├── 📄 package.json                  # Project dependencies
├── 📄 vite.config.js                # Vite configuration
├── 📄 README.md                     # Project documentation (Arabic)
└── 📄 LANGUAGE_GUIDE.md             # Language addition guide
```

## File Descriptions

### 📁 src/locales/

This directory contains all translation files for multi-language support.

#### 📄 ar.js
- **Purpose**: Arabic language translations
- **Exports**: `ar` object containing all Arabic text
- **Usage**: Imported by `index.js` and used throughout the app
- **Format**: Key-value pairs where keys are consistent across all languages

```javascript
export const ar = {
    companyName: 'HAYARCO',
    tagline: 'نظام الإدارة المتقدم',
    // ... more translations
};
```

#### 📄 en.js
- **Purpose**: English language translations
- **Exports**: `en` object containing all English text
- **Structure**: Identical keys to `ar.js` with English values

#### 📄 index.js
- **Purpose**: Central export point for all translations
- **Exports**: `translations` object containing all language objects
- **Usage**: Imported by `App.jsx` to access all translations

```javascript
import { ar } from './ar';
import { en } from './en';

export const translations = { ar, en };
```

### 📁 src/data/

This directory contains initial data and constants.

#### 📄 initialData.js
- **Purpose**: Store default data for the application
- **Exports**:
  - `COLORS`: Array of color codes for UI elements
  - `INITIAL_USERS`: Default admin and employee accounts
  - `INITIAL_EXPENSES`: Sample expense records
  - `INITIAL_DEPTS`: Default department list

```javascript
export const INITIAL_USERS = [
    { id: 1, name: 'adminName', email: 'admin@system.com', ... },
    { id: 2, name: 'employeeName', email: 'user@system.com', ... }
];
```

### 📄 src/App.jsx

**Main Application Component**

- **Purpose**: Core application logic and UI
- **Responsibilities**:
  - State management (users, expenses, attendance, notifications)
  - User authentication
  - View routing (dashboard, attendance, reports, settings)
  - LocalStorage persistence
  - Language switching
  - GPS location tracking

**Key Features**:
- Multi-view system (dashboard, attendance report, accounts, departments)
- Real-time clock and date display
- Notification system
- Expense management
- Attendance tracking
- Data export (Excel/CSV)

**State Variables**:
```javascript
- users: Array of user accounts
- expenses: Array of expense records
- attendanceHistory: Array of attendance records
- departments: Array of department names
- notifications: Array of system notifications
- user: Currently logged-in user
- view: Current active view
- lang: Current language (ar/en)
- isClockedIn: Employee clock-in status
```

### 📄 src/index.css

**Global Styles**

- **Purpose**: Application-wide styling and CSS variables
- **Contains**:
  - CSS custom properties (variables)
  - Global resets
  - Utility classes
  - Component styles
  - Animations
  - Responsive design rules

**CSS Variables**:
```css
--primary: #6366f1;
--success: #10b981;
--danger: #ef4444;
--background: #0f172a;
--card-bg: rgba(30, 41, 59, 0.7);
```

**Key Classes**:
- `.glass-morphism`: Glassmorphism effect
- `.card`: Card container
- `.btn`: Button styles
- `.btn-primary`: Primary button variant
- `.input-field`: Form input styling
- `.grid`: Grid layout

### 📄 src/main.jsx

**Application Entry Point**

- **Purpose**: Initialize and mount React application
- **Responsibilities**:
  - Import React and ReactDOM
  - Import root component (App)
  - Import global styles
  - Mount app to DOM

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 📄 index.html

**HTML Template**

- **Purpose**: Base HTML structure
- **Contains**:
  - Meta tags for SEO and responsiveness
  - Root div for React mounting
  - Script tag for main.jsx
  - Title and favicon references

### 📄 package.json

**Project Configuration**

- **Purpose**: Define project metadata and dependencies
- **Contains**:
  - Project name and version
  - Scripts (dev, build, preview)
  - Dependencies (React, Lucide, Recharts)
  - Dev dependencies (Vite, plugins)

**Key Scripts**:
```json
"dev": "vite"           // Start development server
"build": "vite build"   // Build for production
"preview": "vite preview" // Preview production build
```

### 📄 vite.config.js

**Vite Configuration**

- **Purpose**: Configure Vite build tool
- **Contains**:
  - React plugin configuration
  - Build settings
  - Server settings
  - Path aliases (if any)

## Data Flow

```
┌─────────────────────────────────────────────────┐
│                   main.jsx                      │
│              (Entry Point)                      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                   App.jsx                       │
│         (Main Application Logic)                │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Translations │  │ Initial Data │            │
│  │ (locales/)   │  │ (data/)      │            │
│  └──────────────┘  └──────────────┘            │
│                                                 │
│  State Management:                              │
│  • users                                        │
│  • expenses                                     │
│  • attendance                                   │
│  • notifications                                │
│  • departments                                  │
│                                                 │
│  ┌──────────────────────────────────┐          │
│  │     LocalStorage Persistence     │          │
│  └──────────────────────────────────┘          │
└─────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│                 Browser DOM                     │
│           (Rendered Application)                │
└─────────────────────────────────────────────────┘
```

## Key Features by File

| Feature | Primary File | Supporting Files |
|---------|-------------|------------------|
| Multi-language | App.jsx | locales/*.js |
| User Authentication | App.jsx | data/initialData.js |
| Expense Management | App.jsx | - |
| Attendance Tracking | App.jsx | - |
| Notifications | App.jsx | - |
| Data Persistence | App.jsx | - |
| Styling | index.css | - |
| GPS Location | App.jsx | - |
| Data Export | App.jsx | - |

## Adding New Features

### To add a new language:
1. Create `src/locales/[lang].js`
2. Update `src/locales/index.js`
3. Update language switcher in `App.jsx`

### To add a new view:
1. Add view state in `App.jsx`
2. Create view component/section
3. Add navigation button in header
4. Implement view logic

### To modify styles:
1. Update CSS variables in `index.css` (for global changes)
2. Add/modify classes in `index.css`
3. Use inline styles in `App.jsx` (for component-specific styles)

### To change initial data:
1. Edit `src/data/initialData.js`
2. Clear browser LocalStorage to see changes
3. Restart development server

## Best Practices

1. **Translations**: Always add new text to translation files, never hardcode
2. **State**: Use LocalStorage for persistence, state for reactivity
3. **Styling**: Use CSS variables for consistency
4. **Components**: Keep App.jsx organized by view sections
5. **Data**: Store initial/default data in `data/` directory

---

Last updated: 2026-01-23
