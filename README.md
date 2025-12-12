# SUST CSE Department Website

> A modern, full-stack web application for the Computer Science & Engineering Department at Shahjalal University of Science and Technology (SUST).

## 📖 Overview

This platform serves as a comprehensive management system connecting students, teachers, and administrators of the CSE department. It streamlines academic operations including course enrollment, result management, notice distribution, and administrative tasks.

### Key Capabilities

- **🎓 Academic Management**: Course enrollment, result uploads, and grade distribution
- **📢 Communication**: Targeted notice system (all students, course-specific, or individual)
- **👥 User Roles**: Separate dashboards for Students, Teachers, and Administrators
- **📊 Data Management**: Centralized storage and retrieval of academic records

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    SUST CSE Website                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (React)              Backend (Node.js)         │
│  ├─ Student Portal            ├─ REST API               │
│  ├─ Teacher Portal            ├─ Authentication         │
│  └─ Admin Portal              ├─ File Management        │
│                               └─ Email Service           │
│                                                          │
│                    Database (MongoDB)                    │
│                    ├─ Users & Roles                      │
│                    ├─ Courses & Enrollments              │
│                    ├─ Results & Notices                  │
│                    └─ Academic Records                   │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, Zustand, Vite, Axios |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **File Handling** | Multer (PDF, Excel uploads) |

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB instance
- npm/yarn

### Installation

```bash
# Backend
cd Backend-main/Backend
npm install
cp .env.example .env  # Configure environment variables
npm run dev          # Runs on http://localhost:5001

# Frontend  
cd Front-end
npm install
npm run dev          # Runs on http://localhost:5173
```

## 📂 Repository Structure

```
sust-cse-web/
├── Front-end/              # React application → git@github.com:LegendaryBeast/sust-cse-web-frontend.git
├── Backend-main/Backend/   # Node.js API server → git@github.com:LegendaryBeast/sust_cse_website.git
└── README.md              # This file
```

## 🔐 User Roles & Features

### Students
- Request course enrollment
- View approved enrollments
- Access and download results (PDF/Excel)
- Receive targeted notices

### Teachers  
- Send notices (all students / course-specific / individual)
- Upload course results (file-based)
- Approve/reject enrollment requests
- Manage enrolled students

### Administrators
- Assign courses to teachers
- Manage user accounts
- System-wide announcements
- Access analytics dashboard

## 🆕 Recent Major Updates

- **Notice System Redesign**: Course-based and individual student targeting
- **Result Upload System**: File-based uploads with history tracking
- **Bug Fixes**: Course assignment, enrollment display, result visibility
- **UI Enhancements**: Improved layouts and user experience

## 📚 Documentation

For detailed setup instructions, API documentation, and contribution guidelines, refer to:
- [Frontend Repository](https://github.com/LegendaryBeast/sust-cse-web-frontend)
- [Backend Repository](https://github.com/LegendaryBeast/sust_cse_website)

## 🤝 Contributing

1. Fork the respective repository (Frontend/Backend)
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📞 Contact

**Computer Science & Engineering Department**  
Shahjalal University of Science and Technology (SUST)

---

*Developed for SUST CSE Department • 2024*


## 🚀 Features

### For Students
- 📚 **Course Enrollment**: Request enrollment in available courses
- 📊 **Results**: View and download exam results (PDF/Excel)
- 📢 **Notices**: Receive targeted notices (all students, course-specific, or individual)
- 👤 **Profile Management**: Manage personal information and academic details
- 🎓 **Course Materials**: Access study materials and resources

### For Teachers
- 📝 **Notice Creation**: Send notices to all students, specific course students, or individual students
- 📤 **Result Upload**: Upload course results as PDF or Excel files
- ✅ **Enrollment Management**: Approve/reject student enrollment requests
- 👥 **Student Management**: View and manage enrolled students
- 📚 **Course Management**: Manage assigned courses

### For Admins
- 🎯 **Course Assignment**: Assign courses to teachers
- 👥 **User Management**: Manage students and teachers
- 📊 **Dashboard**: Overview of system statistics
- 🔧 **System Configuration**: Manage banners, news, and announcements

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3 (Vanilla)
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Email Service**: Nodemailer

## 📁 Project Structure

```
sust-cse-web/
├── Front-end/                 # React frontend application
│   ├── src/
│   │   ├── api/              # API services and clients
│   │   ├── components/       # Reusable React components
│   │   │   ├── admin/        # Admin-specific components
│   │   │   ├── student/      # Student-specific components
│   │   │   └── teacher/      # Teacher-specific components
│   │   ├── pages/            # Page components
│   │   ├── zustand/          # State management
│   │   └── main.jsx          # Application entry point
│   └── package.json
│
├── Backend-main/Backend/      # Node.js backend application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Custom middleware
│   │   ├── utils/            # Utility functions
│   │   └── server.ts         # Server entry point
│   ├── uploads/              # Uploaded files directory
│   └── package.json
│
└── README.md                  # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running instance)
- npm or yarn package manager

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/LegendaryBeast/sust_cse_website.git
cd sust-cse-web
```

#### 2. Backend Setup
```bash
cd Backend-main/Backend
npm install

# Create .env file with the following variables:
# MONGODB_URI=mongodb://localhost:27017/sust-cse
# JWT_SECRET=your_jwt_secret_key
# PORT=5001
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

npm run dev
```

#### 3. Frontend Setup
```bash
cd Front-end
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and backend on `http://localhost:5001`.

## 🔑 Default Credentials

After seeding the database, you can use these credentials:

**Admin:**
- Email: admin@sust.edu
- Password: (set during seeding)

**Teacher:**
- Email: teacher@sust.edu
- Password: (set during registration)

**Student:**
- Email: student@sust.edu
- Password: (set during registration)

## 📋 Recent Updates

### Notice System Redesign (December 2024)
- ✅ Replaced batch/session targeting with course-based targeting
- ✅ Teachers can send notices to: All students, Course students, or Individual student by registration ID
- ✅ Students automatically see only relevant notices based on enrollment
- ✅ Backend validates teacher ownership of courses
- ✅ Email notifications to targeted recipients

### Result Upload System (December 2024)
- ✅ File-based result uploads (PDF/Excel only)
- ✅ Course and session/semester selection for uploads
- ✅ Upload history view with delete functionality
- ✅ Fixed file download paths
- ✅ Enhanced student results modal with file type badges

### Bug Fixes
- ✅ Fixed course assignment - now updates `Course.teacherId` when assigning
- ✅ Fixed enrollment request display issues
- ✅ Fixed result visibility bug with simplified filtering
- ✅ Removed advisor and feedback features from dashboards

### UI Improvements
- ✅ Faculty page now displays 4 cards per row on laptops
- ✅ Enhanced modal components with better UX
- ✅ Improved error handling and validation messages

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 API Documentation

### Base URL
- Development: `http://localhost:5001/api`
- Production: `https://your-domain.com/api`

### Key Endpoints

#### Authentication
- `POST /auth/student/register` - Student registration
- `POST /auth/student/login` - Student login
- `POST /auth/teacher/register` - Teacher registration
- `POST /auth/teacher/login` - Teacher login

#### Courses
- `GET /courses` - Get all courses
- `POST /course-offerings` - Create course offering (Admin)
- `GET /enrollments/my-enrollments` - Get student's enrollments

#### Notices
- `POST /notices` - Create notice (Teacher/Admin)
- `GET /notices` - Get notices (filtered for students)
- `DELETE /notices/:id` - Delete notice

#### Results
- `POST /course-results/upload` - Upload result file (Teacher)
- `GET /course-results/my-results` - Get student's results
- `GET /course-results/download/:id` - Download result file

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration for frontend access
- File upload restrictions (type, size)
- Role-based access control (Student, Teacher, Admin)

## 📄 License

This project is developed for the Computer Science & Engineering Department of SUST.

## 👥 Team

- **Developer**: [Tanzim Hasan Prappo - 2021331006]
- **Department**: Computer Science & Engineering, SUST

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub or contact the development team.

---

**Note**: This project is made for Academic Purpose.
