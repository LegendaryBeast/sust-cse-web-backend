# SUST CSE Website Backend

Complete Node.js/Express/TypeScript backend for the SUST Computer Science and Engineering website.

## Features

- ✅ RESTful API with TypeScript
- ✅ MongoDB with Mongoose ODM
- ✅ JWT Authentication & Authorization
- ✅ Role-based access control (admin/superadmin)
- ✅ File upload handling (Multer)
- ✅ Input validation (express-validator)
- ✅ Error handling middleware
- ✅ Security features (Helmet, CORS, Rate Limiting)
- ✅ Request logging (Winston)
- ✅ Response compression

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** express-validator
- **File Upload:** Multer
- **Security:** Helmet, CORS, express-rate-limit
- **Logging:** Winston

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/sust-cse-db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

3. Seed the database with sample data:
```bash
npm run seed
```

4. Start development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin (superadmin only) 🔒
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user 🔒

### Faculty
- `GET /api/faculty` - Get all faculty members
- `GET /api/faculty/:id` - Get single faculty member
- `POST /api/faculty` - Create faculty member 🔒
- `PUT /api/faculty/:id` - Update faculty member 🔒
- `DELETE /api/faculty/:id` - Delete faculty member 🔒

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get single course
- `GET /api/courses/level/:level` - Get courses by level
- `POST /api/courses` - Create course 🔒
- `PUT /api/courses/:id` - Update course 🔒
- `DELETE /api/courses/:id` - Delete course 🔒

### News/Dashboard
- `GET /api/news` - Get all active news items
- `GET /api/news/all` - Get all news (including inactive) 🔒
- `GET /api/news/:id` - Get single news item
- `POST /api/news` - Create news item 🔒
- `PUT /api/news/:id` - Update news item 🔒
- `DELETE /api/news/:id` - Delete news item 🔒

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all submissions 🔒
- `GET /api/contact/:id` - Get single submission 🔒
- `PATCH /api/contact/:id/read` - Mark as read 🔒
- `DELETE /api/contact/:id` - Delete submission 🔒

### File Upload
- `POST /api/upload` - Upload image 🔒

### Health Check
- `GET /api/health` - Server health check

🔒 = Protected route (requires authentication)

## Default Admin Credentials

After running the seed script:
- **Email:** admin@sust.edu
- **Password:** admin123

⚠️ **Important:** Change these credentials in production!

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── server.ts        # Express app entry point
├── uploads/             # Uploaded files
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All errors are handled by a centralized error handling middleware. API responses follow this format:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## License

MIT
