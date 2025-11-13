# Content Planner & Writer Pro - Client Side

Frontend application untuk Content Planner & Writer Pro menggunakan React, Vite, dan Tailwind CSS.

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Pastikan backend server sudah running di `http://localhost:3000` (atau sesuaikan dengan konfigurasi backend).

### 3. Start Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

## 📁 Struktur Folder

```
client/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── routes/          # Page components
│   │   ├── auth/        # Login, Register
│   │   ├── dashboard/    # Dashboard
│   │   ├── products/     # Product management
│   │   ├── briefs/       # Brief management
│   │   ├── calendar/     # Calendar view
│   │   └── settings/    # Settings
│   ├── services/        # API services
│   │   ├── api.js        # Base API config
│   │   ├── auth.api.js
│   │   ├── product.api.js
│   │   ├── brief.api.js
│   │   └── ...
│   ├── store/           # Redux store
│   │   ├── authSlice.js
│   │   ├── productSlice.js
│   │   ├── briefSlice.js
│   │   └── ...
│   ├── utils/           # Utilities
│   │   ├── constants.js
│   │   ├── format.js
│   │   └── ...
│   └── main.jsx         # Entry point
├── public/              # Static files
└── package.json
```

## 🎨 Tech Stack

- **React 19** - UI Library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 🔐 Features

### Authentication
- Login dengan email/password
- Register admin baru
- JWT token management
- Protected routes

### Product Management
- List produk
- Tambah/edit/hapus produk
- Upload foto produk
- Auto-generate PGG (Pain Points, Gains, Goals) dengan AI

### Brief Management
- Generate ide konten dengan AI
- Generate detail konten dengan AI
- Edit detail konten
- Submit untuk approval
- Filter dan search

### Admin Features
- Approval workflow
- Reject dengan alasan
- Calendar view untuk scheduled content
- Schedule content

### Calendar View
- View approved content dalam kalender
- Filter berdasarkan tanggal

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔗 API Integration

Client terhubung ke backend API di `http://localhost:3000` (default). Pastikan:
- Backend server sudah running
- CORS sudah dikonfigurasi dengan benar
- Environment variables sudah diset (jika diperlukan)

## 📝 Notes

- Semua API calls menggunakan Axios dengan base URL dari `src/services/api.js`
- Authentication token disimpan di Redux store dan localStorage (dengan redux-persist)
- Protected routes menggunakan component `Protected.jsx`
- Error handling menggunakan toast notifications (react-hot-toast)
