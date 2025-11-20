# Content Planner & Writer Pro - API Documentation

## Base URL

```
Development: http://localhost:3000
Production: https://your-api-domain.com
```

## Authentication

Kebanyakan endpoint memerlukan authentication menggunakan JWT Bearer token. Token didapatkan dari endpoint `/auth/login` atau `/auth/register`.

### Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Token Format

Token adalah JWT (JSON Web Token) yang berisi:
- `id`: User ID
- `email`: User email
- `name`: User name
- `role`: User role (admin/staff)
- `ProjectId`: Project ID untuk multi-tenant isolation

Token berlaku selama 24 jam (default).

---

## Error Responses

Semua error mengikuti format standar:

```json
{
  "message": "Error message description"
}
```

Untuk validation errors, formatnya:

```json
{
  "message": "First error message",
  "errors": [
    "Error 1",
    "Error 2",
    "Error 3"
  ]
}
```

### HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Validation error atau invalid input)
- `401` - Unauthorized (Token tidak valid atau tidak ada)
- `403` - Forbidden (Tidak memiliki permission)
- `404` - Not Found (Resource tidak ditemukan)
- `500` - Internal Server Error (Server error)

---

## Enums & Constants

### User Roles
- `admin` - Administrator (full access)
- `staff` - Staff member (limited access)

### Brief Status
- `draft` - Draft
- `ready` - Ready for submission
- `pending_approval` - Waiting for approval
- `approved` - Approved by admin
- `rejected` - Rejected by admin
- `scheduled` - Scheduled for publishing

### Funnel Stages
- `awareness` - Awareness
- `consideration` - Consideration
- `retargeting_visitor` - Retargeting Visitor
- `retargeting_atc_not_purchase` - Retargeting ATC Not Purchase
- `after_purchase` - After Purchase
- `revenue` - Revenue
- `loyalty` - Loyalty

### Platforms
- `TikTok`
- `Instagram`
- `Shopee`
- `Meta`
- `YouTube`

### Content Tags
- `video` - Video content
- `carousel` - Carousel post
- `image` - Image post

---

## API Endpoints

## 1. Authentication

### 1.1 Register Admin

Mendaftarkan admin baru dan membuat project baru.

**Endpoint:** `POST /auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "projectName": "My Project Name"
}
```

**Validation:**
- `name`: Required, string, min 3 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters
- `projectName`: Required, string, min 3 characters

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "admin",
  "ProjectId": 1,
  "projectName": "My Project Name",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Email sudah terdaftar atau validation error
- `500` - Server error

---

### 1.2 Login

Login dengan email dan password.

**Endpoint:** `POST /auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation:**
- `email`: Required, valid email format
- `password`: Required, string

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "admin",
    "ProjectId": 1,
    "projectName": "My Project Name"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Email atau password salah
- `500` - Server error

---

### 1.3 Google Login

Login menggunakan Google OAuth token.

**Endpoint:** `POST /auth/login/google`

**Authentication:** Not required

**Request Body:**
```json
{
  "googleAccessToken": "google_oauth_token_here"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "User Name",
    "role": "admin",
    "ProjectId": 1,
    "projectName": "My Project Name"
  }
}
```

**Error Responses:**
- `400` - Google access token diperlukan atau invalid
- `401` - Google token tidak valid
- `500` - Server error

---

### 1.4 Add Staff

Menambahkan staff member baru (Admin only).

**Endpoint:** `POST /auth/staff/add`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Staff Name",
  "email": "staff@example.com",
  "password": "password123"
}
```

**Validation:**
- `name`: Required, string, min 3 characters
- `email`: Required, valid email format
- `password`: Required, min 6 characters

**Response:** `201 Created`
```json
{
  "id": 2,
  "email": "staff@example.com",
  "name": "Staff Name",
  "role": "staff",
  "ProjectId": 1
}
```

**Error Responses:**
- `400` - Email sudah terdaftar atau validation error
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

## 2. Products

### 2.1 Get All Products

Mendapatkan list semua produk dalam project.

**Endpoint:** `GET /products`

**Authentication:** Required

**Query Parameters:**
- None

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "link": "https://example.com/product",
    "imageUrl": "https://cloudinary.com/image.jpg",
    "pains": ["Pain point 1", "Pain point 2"],
    "gains": ["Gain 1", "Gain 2"],
    "goals": ["Goal 1", "Goal 2"],
    "ProjectId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### 2.2 Get Product by ID

Mendapatkan detail produk berdasarkan ID.

**Endpoint:** `GET /products/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Product ID (integer)

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "link": "https://example.com/product",
  "imageUrl": "https://cloudinary.com/image.jpg",
  "pains": ["Pain point 1", "Pain point 2"],
  "gains": ["Gain 1", "Gain 2"],
  "goals": ["Goal 1", "Goal 2"],
  "ProjectId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `404` - Produk tidak ditemukan
- `500` - Server error

---

### 2.3 Create Product

Membuat produk baru. PGG (Pain Points, Gains, Goals) akan di-generate otomatis menggunakan AI.

**Endpoint:** `POST /products`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
- `name` (required) - Product name (string, max 255 chars)
- `description` (optional) - Product description (string)
- `link` (optional) - Product link/URL (string, valid URL)
- `image` (optional) - Product image file (image file, max 5MB)

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "link": "https://example.com/product",
  "imageUrl": "https://cloudinary.com/image.jpg",
  "pains": ["Pain point 1", "Pain point 2", ...],
  "gains": ["Gain 1", "Gain 2", ...],
  "goals": ["Goal 1", "Goal 2", ...],
  "ProjectId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** PGG akan di-generate otomatis menggunakan AI setelah produk dibuat. Jika AI generation gagal, produk tetap dibuat tanpa PGG.

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `413` - File too large (max 5MB)
- `500` - Server error

---

### 2.4 Update Product

Update produk yang sudah ada.

**Endpoint:** `PUT /products/:id`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Path Parameters:**
- `id` (required) - Product ID (integer)

**Request Body (Form Data):**
- `name` (optional) - Product name (string, max 255 chars, tidak boleh kosong)
- `description` (optional) - Product description (string)
- `link` (optional) - Product link/URL (string, valid URL)
- `image` (optional) - Product image file (image file, max 5MB)
- `pains` (optional) - Pain points array (JSON string atau array)
- `gains` (optional) - Gains array (JSON string atau array)
- `goals` (optional) - Goals array (JSON string atau array)

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Updated Product Name",
  "description": "Updated description",
  "link": "https://example.com/updated",
  "imageUrl": "https://cloudinary.com/new-image.jpg",
  "pains": ["Updated pain 1"],
  "gains": ["Updated gain 1"],
  "goals": ["Updated goal 1"],
  "ProjectId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error atau ID tidak valid
- `401` - Unauthorized
- `404` - Produk tidak ditemukan
- `413` - File too large (max 5MB)
- `500` - Server error

---

### 2.5 Delete Product

Menghapus produk.

**Endpoint:** `DELETE /products/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Product ID (integer)

**Response:** `200 OK`
```json
{
  "message": "Produk berhasil dihapus"
}
```

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `404` - Produk tidak ditemukan
- `500` - Server error

---

## 3. Briefs

### 3.1 Get All Briefs

Mendapatkan list semua brief dalam project.

**Endpoint:** `GET /briefs`

**Authentication:** Required

**Query Parameters:**
- `status` (optional) - Filter by status (draft, ready, pending_approval, approved, rejected, scheduled)
- `productId` (optional) - Filter by product ID (integer)
- `funnelStage` (optional) - Filter by funnel stage

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "ProductId": 1,
    "UserId": 1,
    "ProjectId": 1,
    "funnelStage": "awareness",
    "briefType": "Problem-Agitate-Solve",
    "toneOfVoice": "Friendly",
    "targetMarket": "Young adults",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Product Name"
    },
    "user": {
      "id": 1,
      "name": "User Name"
    },
    "details": []
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### 3.2 Get Brief by ID

Mendapatkan detail brief dengan semua details.

**Endpoint:** `GET /briefs/:id`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Brief ID (integer)

**Response:** `200 OK`
```json
{
  "id": 1,
  "ProductId": 1,
  "UserId": 1,
  "ProjectId": 1,
  "funnelStage": "awareness",
  "briefType": "Problem-Agitate-Solve",
  "toneOfVoice": "Friendly",
  "targetMarket": "Young adults",
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "product": {
    "id": 1,
    "name": "Product Name",
    "description": "Product description",
    "imageUrl": "https://cloudinary.com/image.jpg"
  },
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com"
  },
  "details": [
    {
      "id": 1,
      "BriefId": 1,
      "platform": "TikTok",
      "tag": "video",
      "title": "Content Title",
      "funnel": "awareness",
      "cta": "BELI SEKARANG",
      "status": "draft",
      "detail": {
        "objectiveCampaign": "Increase brand awareness",
        "decisionTrigger": "Limited time offer",
        "productValueHighlight": "High quality product",
        "communicationApproach": "Storytelling",
        "hookOpening": "Powerful hook",
        "mainContentPoints": ["Point 1", "Point 2"],
        "breakdownDetail": "Scene breakdown",
        "visualIdentityNote": "Visual notes"
      },
      "caption": "Content caption",
      "hashtags": ["#tag1", "#tag2"],
      "scheduledAt": null,
      "rejectionReason": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "comments": []
}
```

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `404` - Brief tidak ditemukan
- `500` - Server error

---

### 3.3 Generate Brief

Generate ide konten (brief) menggunakan AI.

**Endpoint:** `POST /briefs`

**Authentication:** Required

**Request Body:**
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

**Validation:**
- `ProductId` (required) - Product ID (integer)
- `funnelStage` (required) - Funnel stage atau array of funnel stages. Bisa string (single), array, atau comma-separated string
- `briefType` (optional) - Brief type atau array. Bisa string (single), array, atau comma-separated string
- `toneOfVoice` (optional) - Tone of voice (string, max 100 chars)
- `targetMarket` (optional) - Target market (string, max 500 chars)
- `count` (optional) - Number of brief ideas to generate (integer, 1-20, default: 5)

**Response:** `201 Created`
```json
{
  "id": 1,
  "ProductId": 1,
  "UserId": 1,
  "ProjectId": 1,
  "funnelStage": "awareness",
  "briefType": "Problem-Agitate-Solve",
  "toneOfVoice": "Friendly",
  "targetMarket": "Young adults",
  "status": "draft",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "product": {
    "id": 1,
    "name": "Product Name"
  },
  "user": {
    "id": 1,
    "name": "User Name"
  },
  "details": [
    {
      "id": 1,
      "platform": "TikTok",
      "tag": "video",
      "title": "Generated Title",
      "funnel": "awareness",
      "cta": "BELI SEKARANG",
      "status": "draft",
      "detail": {
        "objectiveCampaign": "...",
        "decisionTrigger": "...",
        "productValueHighlight": "...",
        "communicationApproach": "...",
        "hookOpening": "...",
        "mainContentPoints": ["...", "..."],
        "breakdownDetail": "...",
        "visualIdentityNote": "..."
      }
    }
  ]
}
```

**Error Responses:**
- `400` - Validation error atau ProductId tidak ditemukan
- `401` - Unauthorized
- `404` - Produk tidak ditemukan
- `500` - Server error atau AI service error

---

### 3.4 Generate Brief Detail

Generate detail konten untuk brief detail menggunakan AI.

**Endpoint:** `POST /briefs/:id/detail`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Brief Detail ID (integer)

**Request Body:**
```json
{}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "BriefId": 1,
  "platform": "TikTok",
  "tag": "video",
  "title": "Updated Title",
  "funnel": "awareness",
  "cta": "BELI SEKARANG",
  "status": "draft",
  "detail": {
    "objectiveCampaign": "...",
    "decisionTrigger": "...",
    "productValueHighlight": "...",
    "communicationApproach": "...",
    "hookOpening": "...",
    "mainContentPoints": ["...", "..."],
    "breakdownDetail": "...",
    "visualIdentityNote": "..."
  },
  "caption": "Generated caption with #hashtags",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** 
- AI akan generate caption dan hashtags berdasarkan brief dan product info
- Jika hashtags array kosong, hashtags akan di-extract dari caption
- Detail breakdown akan di-generate berdasarkan platform dan tag

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `404` - Brief detail tidak ditemukan atau product tidak ditemukan
- `500` - Server error atau AI service error

---

### 3.5 Update Brief Detail

Update detail brief.

**Endpoint:** `PUT /briefs/:id/detail`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Brief Detail ID (integer)

**Request Body:**
```json
{
  "platform": "TikTok",
  "tag": "video",
  "title": "Updated Title",
  "funnel": "awareness",
  "cta": "BELI SEKARANG",
  "detail": {
    "objectiveCampaign": "Updated objective",
    "decisionTrigger": "Updated trigger"
  },
  "caption": "Updated caption",
  "hashtags": ["#tag1", "#tag2"],
  "status": "ready",
  "scheduledAt": "2024-12-25T10:00:00Z"
}
```

**Validation:**
- `platform` (optional) - Platform (TikTok, Instagram, Shopee, Meta, YouTube)
- `tag` (optional) - Tag (video, carousel, image)
- `title` (optional) - Title (string, max 255 chars, tidak boleh kosong)
- `funnel` (optional) - Funnel stage (valid funnel stage)
- `cta` (optional) - CTA (string, max 100 chars)
- `detail` (optional) - Detail object (object)
- `caption` (optional) - Caption (string, max 2000 chars)
- `hashtags` (optional) - Hashtags array (array of strings, max 100 chars per hashtag)
- `status` (optional) - Status (draft, ready, pending_approval, approved, rejected, scheduled)
- `scheduledAt` (optional) - Scheduled date (ISO date string atau null)

**Response:** `200 OK`
```json
{
  "id": 1,
  "BriefId": 1,
  "platform": "TikTok",
  "tag": "video",
  "title": "Updated Title",
  "funnel": "awareness",
  "cta": "BELI SEKARANG",
  "status": "ready",
  "detail": {
    "objectiveCampaign": "Updated objective",
    "decisionTrigger": "Updated trigger"
  },
  "caption": "Updated caption",
  "hashtags": ["#tag1", "#tag2"],
  "scheduledAt": "2024-12-25T10:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "brief": {
    "id": 1,
    "ProductId": 1
  }
}
```

**Error Responses:**
- `400` - Validation error atau ID tidak valid
- `401` - Unauthorized
- `404` - Brief detail tidak ditemukan
- `500` - Server error

---

### 3.6 Submit Brief Detail for Approval

Submit brief detail untuk approval admin.

**Endpoint:** `POST /briefs/:id/detail/submit`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Brief Detail ID (integer)

**Request Body:**
```json
{
  "scheduledAt": "2024-12-25",
  "scheduledTime": "10:00"
}
```

**Validation:**
- `scheduledAt` (required) - Scheduled date (YYYY-MM-DD format)
- `scheduledTime` (required) - Scheduled time (HH:mm format)
- Scheduled date tidak boleh di masa lalu

**Response:** `200 OK`
```json
{
  "id": 1,
  "BriefId": 1,
  "status": "pending_approval",
  "scheduledAt": "2024-12-25T10:00:00.000Z",
  "rejectionReason": null,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** 
- Status akan berubah menjadi `pending_approval`
- `rejectionReason` akan di-clear jika ada
- `scheduledAt` akan di-set berdasarkan `scheduledAt` + `scheduledTime`

**Error Responses:**
- `400` - Validation error, ID tidak valid, atau scheduled date di masa lalu
- `401` - Unauthorized
- `404` - Brief detail tidak ditemukan
- `500` - Server error

---

### 3.7 Delete Brief Detail

Menghapus brief detail.

**Endpoint:** `DELETE /briefs/:id/detail`

**Authentication:** Required

**Path Parameters:**
- `id` (required) - Brief Detail ID (integer)

**Response:** `200 OK`
```json
{
  "message": "Detail brief berhasil dihapus"
}
```

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `404` - Brief detail tidak ditemukan
- `500` - Server error

---

## 4. Admin

Semua endpoint di section ini memerlukan **Admin role**.

### 4.1 Get Pending Approvals

Mendapatkan list semua brief yang memiliki detail dengan status pending approval.

**Endpoint:** `GET /admin/approvals`

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "ProductId": 1,
    "UserId": 1,
    "ProjectId": 1,
    "funnelStage": "awareness",
    "briefType": "Problem-Agitate-Solve",
    "toneOfVoice": "Friendly",
    "targetMarket": "Young adults",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Product Name"
    },
    "user": {
      "id": 1,
      "name": "User Name"
    },
    "details": [
      {
        "id": 1,
        "BriefId": 1,
        "platform": "TikTok",
        "tag": "video",
        "title": "Content Title",
        "funnel": "awareness",
        "cta": "BELI SEKARANG",
        "status": "pending_approval",
        "caption": "Content caption",
        "hashtags": ["#tag1", "#tag2"],
        "scheduledAt": "2024-12-25T10:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "comments": []
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

### 4.2 Get Pending Approvals Count

Mendapatkan jumlah brief details yang pending approval.

**Endpoint:** `GET /admin/approvals/count`

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
{
  "count": 5
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

### 4.3 Approve Brief

Approve semua detail dalam brief dan schedule jika ada scheduledAt.

**Endpoint:** `PUT /admin/approvals/:id/approve`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (required) - Brief ID (integer)

**Request Body:**
```json
{
  "scheduledAt": "2024-12-25T10:00:00Z",
  "scheduledTime": "10:00"
}
```

**Validation:**
- `scheduledAt` (optional) - Scheduled date (ISO date string)
- `scheduledTime` (optional) - Scheduled time (HH:mm format)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "approved",
  "details": [
    {
      "id": 1,
      "status": "approved",
      "scheduledAt": "2024-12-25T10:00:00.000Z"
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:**
- Semua detail dengan status `pending_approval` akan di-approve
- Jika `scheduledAt` dan `scheduledTime` disediakan, akan di-set ke semua detail
- Status brief dan detail akan berubah menjadi `approved`

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `404` - Brief tidak ditemukan
- `500` - Server error

---

### 4.4 Reject Brief

Reject brief detail dengan alasan.

**Endpoint:** `PUT /admin/approvals/:id/reject`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `id` (required) - Brief ID (integer)

**Request Body:**
```json
{
  "rejectionReason": "Content tidak sesuai dengan brand guidelines"
}
```

**Validation:**
- `rejectionReason` (required) - Alasan rejection (string, tidak boleh kosong)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "rejected",
  "details": [
    {
      "id": 1,
      "status": "rejected",
      "rejectionReason": "Content tidak sesuai dengan brand guidelines"
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:**
- Semua detail dengan status `pending_approval` akan di-reject
- Status brief dan detail akan berubah menjadi `rejected`
- `rejectionReason` akan disimpan di setiap detail

**Error Responses:**
- `400` - Validation error atau ID tidak valid
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `404` - Brief tidak ditemukan
- `500` - Server error

---

### 4.5 Approve Detail

Approve single brief detail.

**Endpoint:** `PUT /admin/approvals/detail/:detailId/approve`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `detailId` (required) - Brief Detail ID (integer)

**Request Body:**
```json
{
  "scheduledAt": "2024-12-25T10:00:00Z"
}
```

**Validation:**
- `scheduledAt` (optional) - Scheduled date (ISO date string)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "approved",
  "scheduledAt": "2024-12-25T10:00:00.000Z",
  "rejectionReason": null,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - ID tidak valid
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `404` - Brief detail tidak ditemukan
- `500` - Server error

---

### 4.6 Reject Detail

Reject single brief detail dengan alasan.

**Endpoint:** `PUT /admin/approvals/detail/:detailId/reject`

**Authentication:** Required (Admin only)

**Path Parameters:**
- `detailId` (required) - Brief Detail ID (integer)

**Request Body:**
```json
{
  "rejectionReason": "Caption terlalu panjang"
}
```

**Validation:**
- `rejectionReason` (required) - Alasan rejection (string, tidak boleh kosong)

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "rejected",
  "rejectionReason": "Caption terlalu panjang",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error atau ID tidak valid
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `404` - Brief detail tidak ditemukan
- `500` - Server error

---

### 4.7 Get Calendar

Mendapatkan data kalender untuk brief details yang sudah di-approve dan scheduled.

**Endpoint:** `GET /admin/calendar`

**Authentication:** Required (Admin only)

**Query Parameters:**
- None

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "BriefId": 1,
    "platform": "TikTok",
    "tag": "video",
    "title": "Content Title",
    "funnel": "awareness",
    "cta": "BELI SEKARANG",
    "status": "scheduled",
    "scheduledAt": "2024-12-25T10:00:00.000Z",
    "brief": {
      "id": 1,
      "ProductId": 1,
      "product": {
        "id": 1,
        "name": "Product Name"
      },
      "user": {
        "id": 1,
        "name": "User Name"
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

### 4.8 Get Team

Mendapatkan list semua team members dalam project.

**Endpoint:** `GET /admin/team`

**Authentication:** Required (Admin only)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "ProjectId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Staff Name",
    "email": "staff@example.com",
    "role": "staff",
    "ProjectId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

### 4.9 Update Project Name

Update nama project.

**Endpoint:** `PUT /admin/project/name`

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "New Project Name"
}
```

**Validation:**
- `name` (required) - Project name (string, min 3 characters)

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "New Project Name",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `403` - Forbidden (bukan admin)
- `500` - Server error

---

## 5. Calendar

### 5.1 Get Calendar

Mendapatkan approved briefs untuk kalender (accessible by all authenticated users).

**Endpoint:** `GET /calendar`

**Authentication:** Required

**Query Parameters:**
- `start` (optional) - Start date (ISO date string, e.g., "2024-01-01")
- `end` (optional) - End date (ISO date string, e.g., "2024-12-31")

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "BriefId": 1,
    "platform": "TikTok",
    "tag": "video",
    "title": "Content Title",
    "funnel": "awareness",
    "cta": "BELI SEKARANG",
    "status": "scheduled",
    "scheduledAt": "2024-12-25T10:00:00.000Z",
    "brief": {
      "id": 1,
      "ProductId": 1,
      "product": {
        "id": 1,
        "name": "Product Name"
      },
      "user": {
        "id": 1,
        "name": "User Name"
      }
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## Data Models

### Product Model
```typescript
{
  id: number;
  name: string;
  description: string | null;
  link: string | null;
  imageUrl: string | null;
  pains: string[];
  gains: string[];
  goals: string[];
  ProjectId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Brief Model
```typescript
{
  id: number;
  ProductId: number;
  UserId: number;
  ProjectId: number;
  funnelStage: string;
  briefType: string;
  toneOfVoice: string;
  targetMarket: string;
  status: "draft" | "ready" | "pending_approval" | "approved" | "rejected" | "scheduled";
  createdAt: Date;
  updatedAt: Date;
}
```

### BriefDetail Model
```typescript
{
  id: number;
  BriefId: number;
  ProjectId: number;
  platform: "TikTok" | "Instagram" | "Shopee" | "Meta" | "YouTube";
  tag: "video" | "carousel" | "image";
  title: string;
  funnel: string;
  cta: string;
  detail: {
    objectiveCampaign?: string;
    decisionTrigger?: string;
    productValueHighlight?: string;
    communicationApproach?: string;
    hookOpening?: string;
    mainContentPoints?: string[];
    breakdownDetail?: string;
    visualIdentityNote?: string;
  };
  caption: string | null;
  hashtags: string[];
  status: "draft" | "ready" | "pending_approval" | "approved" | "rejected" | "scheduled";
  scheduledAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Model
```typescript
{
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: "admin" | "staff";
  ProjectId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider implementing rate limiting for production use.

## File Upload Limits

- **Max file size**: 5MB
- **Allowed formats**: Images (jpg, jpeg, png, webp, gif)
- **Storage**: Cloudinary CDN

## Notes

1. **Multi-Tenant Isolation**: Semua data diisolasi per project. User hanya bisa mengakses data dari project mereka sendiri.

2. **AI Generation**: 
   - PGG generation untuk produk membutuhkan waktu beberapa detik
   - Brief generation bisa memakan waktu 10-30 detik tergantung jumlah ide
   - Detail generation membutuhkan waktu 5-15 detik

3. **Token Expiration**: JWT token berlaku selama 24 jam. User perlu login ulang setelah token expired.

4. **CORS**: CORS dikonfigurasi berdasarkan `CORS_ORIGIN` environment variable. Di production, pastikan frontend URL sudah di-set dengan benar.

5. **Error Handling**: Semua error di-handle oleh global error handler dan mengembalikan format JSON yang konsisten.

---

## Example Requests

### cURL Examples

#### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "password123",
    "projectName": "My Project"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

#### Get Products (with token)
```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Create Product (with file upload)
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=Product Name" \
  -F "description=Product description" \
  -F "link=https://example.com/product" \
  -F "image=@/path/to/image.jpg"
```

#### Generate Brief
```bash
curl -X POST http://localhost:3000/briefs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "ProductId": 1,
    "funnelStage": "awareness",
    "briefType": "Problem-Agitate-Solve",
    "toneOfVoice": "Friendly",
    "targetMarket": "Young adults",
    "count": 5
  }'
```

---

## Support

Untuk pertanyaan atau issues, silakan buka issue di repository atau hubungi development team.

