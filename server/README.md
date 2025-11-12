# Content Planner & Writer Pro - Server Side

Server-side application untuk Content Planner & Writer Pro menggunakan Express.js, Sequelize, PostgreSQL (Supabase), dan Cloudinary untuk file storage.

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Aplikasi menggunakan Supabase (PostgreSQL cloud). Dapatkan connection string dari Supabase Dashboard:
- Settings → Database → Connection String
- Gunakan "Session Pooler" untuk IPv4 compatibility
- Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres`

### 3. Setup Environment

Copy `.env.example` ke `.env` dan isi dengan konfigurasi yang sesuai:

```env
PORT=3000
JWT_SECRET=FILL_ME_IN
OPENAI_KEY=FILL_ME_IN
DATABASE_URL=FILL_ME_IN
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=FILL_ME_IN
CLOUDINARY_API_KEY=FILL_ME_IN
CLOUDINARY_API_SECRET=FILL_ME_IN
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
├── services/             # AI, Upload services
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
- `POST /products` - Tambah produk (dengan upload foto, PGG otomatis di-generate)
- `PUT /products/:id` - Update produk
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
- Upload file maksimal 5MB, disimpan di Cloudinary
- Database menggunakan Supabase (PostgreSQL cloud)
- File upload menggunakan Cloudinary CDN

