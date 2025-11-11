# Content Planner & Writer Pro - Server Side

Server-side application untuk Content Planner & Writer Pro menggunakan Express.js, Sequelize, dan PostgreSQL.

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Pastikan PostgreSQL sudah terinstall dan running. Buat database:

```sql
CREATE DATABASE content_planner_dev;
```

### 3. Setup Environment

Copy `.env.example` ke `.env` dan isi dengan konfigurasi yang sesuai:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_change_in_production
OPENAI_KEY=your_openai_api_key_here
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/content_planner_dev
NODE_ENV=development
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📁 Struktur Folder

```
content-planner-server/
├── app.js                 # Entry point
├── config/               # Database config
├── models/               # Sequelize models
├── controllers/          # Business logic
├── services/             # AI, Upload, Socket services
├── middleware/           # Auth, Authorization, Error handling
├── helpers/              # Utilities (bcrypt, jwt, enums)
├── routes/               # API routes
└── uploads/              # Uploaded files
```

## 🔐 API Endpoints

### Authentication
- `POST /auth/register` - Register admin baru + buat project
- `POST /auth/login` - Login dan dapatkan token
- `POST /auth/staff/add` - Tambah staff (Admin only)

### Products
- `GET /products` - List semua produk
- `GET /products/:id` - Detail produk
- `POST /products` - Tambah produk (dengan upload foto)
- `PUT /products/:id` - Update produk
- `POST /products/:id/regenerate-pgg` - Regenerate Pain/Gain/Goals
- `DELETE /products/:id` - Hapus produk

### Briefs
- `GET /briefs` - List semua brief
- `GET /briefs/:id` - Detail brief
- `POST /briefs` - Generate brief (AI)
- `POST /briefs/:id/detail` - Generate detail brief (AI)
- `PUT /briefs/:id/detail` - Update detail brief
- `PUT /briefs/:id/submit` - Submit for approval

### Admin
- `GET /admin/approvals` - List pending approvals
- `PUT /admin/approvals/:id/approve` - Approve brief
- `PUT /admin/approvals/:id/reject` - Reject brief
- `GET /admin/calendar` - Get calendar data
- `PUT /admin/calendar/:id/schedule` - Schedule brief detail

### Calendar
- `GET /calendar` - Get approved briefs untuk kalender

## 🤖 AI Integration

Server menggunakan OpenAI API untuk:
- Generate Pain Points, Gains, Goals (PGG) produk
- Generate ide konten (brief)
- Generate detail konten (scene breakdown, slides, layout)
- Generate caption dan hashtag

Pastikan `OPENAI_KEY` sudah diisi di `.env`.

## 📝 Notes

- Semua endpoint (kecuali register/login) memerlukan authentication header: `Authorization: Bearer <token>`
- Data diisolasi per project (multi-tenant)
- Upload file maksimal 5MB
- Socket.io digunakan untuk realtime comments

