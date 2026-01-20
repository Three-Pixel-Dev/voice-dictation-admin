# Voice Dictation Admin

Admin dashboard for Voice Dictation application built with React, TypeScript, Tailwind CSS, and shadcn/ui components.

## Features

- 🎨 Modern UI design inspired by shadcn-admin
- 📱 Responsive layout
- 🌙 Dark mode support (ready)
- 🔐 Sign in page
- 📊 Dashboard with statistics
- 👥 User management
- 🎯 Member levels management
- ⚙️ Settings page with profile and password change

## Tech Stack

- **React** 19.2.3
- **TypeScript** 4.9.5
- **Tailwind CSS** 3.4.14
- **shadcn/ui** components
- **React Router** 6.28.0
- **Lucide React** icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   └── ui/              # shadcn/ui components
├── pages/               # Page components
│   ├── SignIn.tsx
│   ├── Dashboard.tsx
│   ├── MemberLevels.tsx
│   ├── Users.tsx
│   └── Settings.tsx
├── lib/                 # Utility functions
└── App.tsx              # Main app component with routing
```

## Pages

- **Sign In** (`/signin`) - Authentication page
- **Dashboard** (`/dashboard`) - Overview with statistics
- **Member Levels** (`/member-levels`) - Manage subscription levels
- **Users** (`/users`) - User listing and management
- **Settings** (`/settings`) - Profile and password management

## Customization

The design follows the shadcn-admin pattern with:
- Sidebar navigation
- Header with search
- Card-based layouts
- Table components for data display
- Form components for user input

## Next Steps

1. Connect to your backend API
2. Implement authentication logic
3. Add data fetching for users and member levels
4. Implement CRUD operations
5. Add error handling and loading states
6. Add toast notifications for user feedback

## License

MIT
