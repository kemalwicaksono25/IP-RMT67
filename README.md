# Content Planner & Writer Pro

Aplikasi web untuk membantu tim marketing membuat dan mengelola konten social media dengan bantuan AI. Aplikasi ini memungkinkan admin dan staff untuk membuat brief konten, generate detail konten menggunakan AI, dan mengelola approval workflow.

## 🚀 Fitur Utama

- **Product Management**: Kelola produk dengan auto-generate Pain Points, Gains, Goals (PGG) menggunakan AI
- **AI Content Generation**: Generate ide konten dan detail konten menggunakan OpenAI
- **Multi-Platform Support**: TikTok, Instagram, Shopee, Meta, YouTube
- **Approval Workflow**: Sistem approval untuk admin dengan tracking status
- **Calendar View**: Kalender untuk melihat jadwal konten yang sudah di-approve
- **Multi-Tenant**: Setiap project memiliki data yang terisolasi

## 📁 Struktur Project

```
IP-RMT67/
├── client/          # Frontend (React + Vite)
├── server/          # Backend (Express.js + Sequelize)
└── README.md        # File ini
```

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Redux Toolkit
- React Router

### Backend
- Node.js + Express.js
- Sequelize ORM
- PostgreSQL (Supabase)
- OpenAI API
- Cloudinary (File Storage)
- JWT Authentication

## 📚 Dokumentasi

- [Server Documentation](./server/README.md) - Setup dan dokumentasi backend
- [Client Documentation](./client/README.md) - Setup dan dokumentasi frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- PostgreSQL database (atau Supabase)
- OpenAI API Key
- Cloudinary account

### Setup

1. **Clone repository**
```bash
git clone <repository-url>
cd IP-RMT67
```

2. **Setup Backend**
```bash
cd server
npm install
cp .env.example .env
# Edit .env dengan konfigurasi yang sesuai
npm run migrate
npm run dev
```

3. **Setup Frontend**
```bash
cd client
npm install
npm run dev
```

Lihat dokumentasi lengkap di folder masing-masing untuk detail setup.

## 📝 Testing

### Backend Tests
```bash
cd server
npm test              # Run all tests
npm test -- --coverage # Run with coverage report
```

## 📄 License

ISC
