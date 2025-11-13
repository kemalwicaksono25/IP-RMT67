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
GOOGLE_CLIENT_ID=FILL_ME_IN
```

**Environment Variables:**

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key untuk JWT token signing
- `OPENAI_KEY` - OpenAI API key untuk AI features
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin (frontend URL)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID (optional)

### 4. Run Migrations

```bash
npm run migrate
```

Untuk rollback migration:

```bash
npm run migrate:undo
```

### 5. Start Server

Development mode (dengan auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## 📁 Struktur Folder

```
server/
├── app.js                 # Entry point aplikasi
├── config/                # Konfigurasi database
│   └── config.js
├── controllers/           # Business logic controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── briefController.js
│   └── productController.js
├── models/                # Sequelize models
│   ├── index.js           # Model associations
│   ├── project.js
│   ├── user.js
│   ├── product.js
│   ├── brief.js
│   ├── briefDetail.js
│   └── comment.js
├── migrations/            # Database migrations
├── routes/                # API route definitions
│   ├── index.js
│   ├── auth.js
│   ├── product.js
│   ├── brief.js
│   └── admin.js
├── middleware/            # Express middleware
│   ├── authentication.js  # JWT authentication
│   ├── authorization.js   # Role-based access control
│   ├── errorHandler.js    # Global error handler
│   ├── projectScope.js    # Multi-tenant isolation
│   └── validators/        # Request validation
│       ├── authValidator.js
│       ├── productValidator.js
│       ├── briefValidator.js
│       └── adminValidator.js
├── services/              # External services
│   ├── aiService.js       # OpenAI integration
│   └── uploadService.js   # Cloudinary upload
├── helpers/               # Utility functions
│   ├── jwt.js             # JWT token handling
│   ├── bcrypt.js          # Password hashing
│   └── enums.js           # Constants & enums
├── errors/                # Custom error classes
│   ├── AppError.js
│   └── handlers/          # Error handlers
├── __tests__/             # Test files
├── scripts/               # Utility scripts
└── uploads/               # Local file uploads (temporary)
```

## 🗄️ Database Models & Relationships

### Models

1. **Project** - Multi-tenant project container

   - `id`, `name`, `createdAt`, `updatedAt`

2. **User** - User accounts (Admin/Staff)

   - `id`, `email`, `password`, `name`, `role`, `ProjectId`
   - Roles: `admin`, `staff`

3. **Product** - Products dalam project

   - `id`, `name`, `description`, `link`, `imageUrl`, `pgg`, `ProjectId`
   - `pgg`: JSON field untuk Pain Points, Gains, Goals

4. **Brief** - Content brief ide

   - `id`, `ProductId`, `UserId`, `ProjectId`, `funnelStage`, `briefType`, `toneOfVoice`, `targetMarket`, `status`
   - Status: `draft`, `ready`, `pending_approval`, `approved`, `rejected`, `scheduled`

5. **BriefDetail** - Detail konten dari brief

   - `id`, `BriefId`, `ProjectId`, `platform`, `tag`, `title`, `funnel`, `cta`, `detail`, `caption`, `hashtags`, `status`, `scheduledAt`, `rejectionReason`
   - Platform: `TikTok`, `Instagram`, `Shopee`, `Meta`, `YouTube`
   - Tag: `video`, `carousel`, `image`
   - Funnel: `awareness`, `consideration`, `retargeting_visitor`, `retargeting_atc_not_purchase`, `after_purchase`, `revenue`, `loyalty`

6. **Comment** - Comments pada brief
   - `id`, `BriefId`, `UserId`, `ProjectId`, `content`

### Relationships

```
Project
├── hasMany User
├── hasMany Product
├── hasMany Brief
├── hasMany BriefDetail
└── hasMany Comment

User
├── belongsTo Project
├── hasMany Brief
└── hasMany Comment

Product
├── belongsTo Project
└── hasMany Brief

Brief
├── belongsTo Project
├── belongsTo Product
├── belongsTo User
├── hasMany BriefDetail
└── hasMany Comment

BriefDetail
├── belongsTo Brief
└── belongsTo Project

Comment
├── belongsTo Brief
├── belongsTo User
└── belongsTo Project
```

## 🔐 API Endpoints

### Authentication

#### Register Admin

```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name",
  "projectName": "My Project"
}
```

Response:

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "admin",
    "ProjectId": 1
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Add Staff (Admin Only)

```http
POST /auth/staff/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "password123",
  "name": "Staff Name"
}
```

### Products

- `GET /products` - List semua produk (filtered by project)
- `GET /products/:id` - Detail produk
- `POST /products` - Tambah produk
  ```json
  {
    "name": "Product Name",
    "description": "Product description",
    "link": "https://example.com/product"
  }
  ```
  - Upload foto via `multipart/form-data` dengan field `image`
  - PGG akan auto-generate menggunakan AI
- `PUT /products/:id` - Update produk
- `DELETE /products/:id` - Hapus produk

### Briefs

- `GET /briefs` - List semua brief (filtered by project)
  - Query params: `status`, `productId`, `funnelStage`
- `GET /briefs/:id` - Detail brief dengan details
- `POST /briefs` - Generate brief menggunakan AI
  ```json
  {
    "ProductId": 1,
    "funnelStage": "awareness",
    "briefType": "Problem-Agitate-Solve",
    "toneOfVoice": "Friendly",
    "targetMarket": "Young adults",
    "count": 5
  }
  ```
- `POST /briefs/:id/detail` - Generate detail brief menggunakan AI
- `PUT /briefs/:id/detail` - Update detail brief
  ```json
  {
    "platform": "TikTok",
    "tag": "video",
    "title": "Updated Title",
    "funnel": "awareness",
    "cta": "BELI SEKARANG",
    "caption": "Updated caption",
    "hashtags": ["#tag1", "#tag2"],
    "status": "ready"
  }
  ```
- `PUT /briefs/:id/submit` - Submit untuk approval
  ```json
  {
    "scheduledAt": "2024-12-25",
    "scheduledTime": "10:00"
  }
  ```

### Admin

- `GET /admin/approvals` - List pending approvals
- `PUT /admin/approvals/:id/approve` - Approve brief
- `PUT /admin/approvals/:id/reject` - Reject brief
  ```json
  {
    "rejectionReason": "Reason for rejection"
  }
  ```
- `GET /admin/calendar` - Get calendar data
- `PUT /admin/calendar/:id/schedule` - Schedule brief detail
  ```json
  {
    "scheduledAt": "2024-12-25T10:00:00Z"
  }
  ```

### Calendar

- `GET /calendar` - Get approved briefs untuk kalender
  - Query params: `start`, `end` (ISO date strings)

## 🔒 Authentication & Authorization

### Authentication Flow

1. User login/register → dapat JWT token
2. Setiap request (kecuali register/login) memerlukan header:
   ```
   Authorization: Bearer <token>
   ```
3. Token di-verify oleh `authentication` middleware
4. User info disimpan di `req.user`

### Authorization

- **Admin**: Akses penuh (CRUD semua resources + admin endpoints)
- **Staff**: Akses terbatas (tidak bisa akses admin endpoints)

Middleware `authorization` memeriksa role user sebelum mengizinkan akses.

### Multi-Tenant Isolation

Semua data diisolasi per project menggunakan middleware `projectScope`. User hanya bisa mengakses data dari project mereka sendiri.

## 🤖 AI Integration

Server menggunakan OpenAI API untuk:

1. **Generate PGG (Pain Points, Gains, Goals)**

   - Otomatis saat upload produk baru
   - Input: Product name, description, image
   - Output: 10 Pain Points, 10 Gains, 10 Goals

2. **Generate Brief Ideas**

   - Input: Product, funnel stages, brief types, tone, target market
   - Output: Array of brief ideas dengan platform, tag, title, funnel, dll.

3. **Generate Brief Detail**
   - Input: Brief, Product info
   - Output: Detail konten lengkap (caption, hashtags, breakdown, dll.)

Pastikan `OPENAI_KEY` sudah diisi di `.env`.

## 🧪 Testing

### Run Tests

```bash
# Run all tests dengan coverage
npm test

# Run tests tanpa coverage (faster)
npm run test:debug

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
__tests__/
├── controllers/          # Controller unit tests
├── middleware/           # Middleware tests
├── services/             # Service tests
├── helpers/              # Helper function tests
├── models/               # Model tests
├── errors/               # Error handler tests
└── integration/          # Integration tests
```

### Coverage

Test coverage report tersedia di `coverage/lcov-report/index.html` setelah menjalankan `npm test`.

## 📝 Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server (nodemon)
npm run migrate        # Run database migrations
npm run migrate:undo   # Rollback last migration
npm run seed           # Run database seeds
npm test               # Run tests with coverage
npm run test:watch     # Run tests in watch mode
npm run test:debug     # Run tests without coverage
```

## 🛠️ Middleware

### Authentication

- Verifies JWT token dari Authorization header
- Menambahkan user info ke `req.user`
- Error: 401 jika token tidak valid

### Authorization

- Memeriksa role user (admin/staff)
- Error: 403 jika tidak memiliki permission

### Project Scope

- Memastikan user hanya mengakses data dari project mereka
- Otomatis filter queries berdasarkan `ProjectId`

### Error Handler

- Global error handler untuk semua errors
- Menangani berbagai error types:
  - `AppError` - Custom application errors
  - `SequelizeValidationError` - Database validation errors
  - `SequelizeUniqueConstraintError` - Unique constraint violations
  - `SequelizeForeignKeyConstraintError` - Foreign key violations
  - `JsonWebTokenError` - Invalid JWT tokens
  - `TokenExpiredError` - Expired JWT tokens
  - `MulterError` - File upload errors
  - `CastError` - Type casting errors

### Validators

- Request body validation sebelum masuk ke controller
- Mengembalikan 400 dengan error messages jika validation gagal

## 📤 File Upload

- **Max file size**: 5MB
- **Storage**: Cloudinary CDN
- **Supported formats**: Images (jpg, png, webp, dll.)
- **Upload endpoint**: `/products` (POST) dengan field `image`

File di-upload ke Cloudinary dan URL disimpan di database.

## 🚨 Error Responses

Semua error mengikuti format:

```json
{
  "message": "Error message",
  "errors": [] // Optional: validation errors
}
```

Status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication failed)
- `403` - Forbidden (authorization failed)
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Troubleshooting

### Database Connection Issues

1. Pastikan `DATABASE_URL` sudah benar
2. Untuk Supabase, gunakan Session Pooler connection string
3. Check database credentials di Supabase Dashboard

### OpenAI API Errors

1. Pastikan `OPENAI_KEY` sudah diisi
2. Check API quota/limits di OpenAI Dashboard
3. Verify API key masih aktif

### Cloudinary Upload Errors

1. Pastikan Cloudinary credentials sudah benar
2. Check file size (max 5MB)
3. Verify file format didukung

### JWT Token Issues

1. Pastikan `JWT_SECRET` sudah diisi
2. Token expired? Login ulang untuk dapat token baru
3. Check token format: `Bearer <token>`

## 🚀 Deployment

### Environment Variables untuk Production

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<strong-secret>
OPENAI_KEY=<your-key>
DATABASE_URL=<production-db-url>
CORS_ORIGIN=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

## 📝 Notes

- Semua endpoint (kecuali register/login) memerlukan authentication header: `Authorization: Bearer <token>`
- Data diisolasi per project (multi-tenant)
- Upload file maksimal 5MB, disimpan di Cloudinary
- Database menggunakan Supabase (PostgreSQL cloud)
- File upload menggunakan Cloudinary CDN
- AI features memerlukan OpenAI API key yang valid
- Test coverage: 100% untuk middleware dan validators

## 📄 License

ISC
