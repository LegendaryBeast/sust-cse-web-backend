# Postman Collection for SUST Academic Management System

## Files

1. **SUST_AMS_Collection.postman_collection.json** - Main API collection with all 60+ endpoints
2. **SUST_AMS_Local.postman_environment.json** - Environment variables for local development

## How to Import

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button (top left)
3. Select `SUST_AMS_Collection.postman_collection.json`
4. Click "Import"

### Step 2: Import Environment
1. Click "Import" again
2. Select `SUST_AMS_Local.postman_environment.json`
3. Click "Import"

### Step 3: Select Environment
1. In the top-right corner, click the environment dropdown
2. Select "SUST AMS - Local"
3. The `{{baseUrl}}` will now point to http://localhost:5000

## Quick Start

### 1. Health Check
- Go to **0. System → Health Check**
- Click "Send"
- Should return `200 OK` with server status

### 2. Admin Login
- Go to **1. Authentication → Admin → Admin Login**
- Default credentials:
  ```json
  {
    "email": "admin@sust.edu",
    "password": "admin123"
  }
  ```
- Click "Send"
- The `adminToken` is automatically saved to environment variables!

### 3. Test Protected Endpoints
- Go to any protected endpoint (e.g., **2. Admin Management → Get All Registration IDs**)
- The Authorization header will automatically use `{{adminToken}}`
- Click "Send"

## Collection Structure

### 0. System (2 endpoints)
- Health Check
- System Statistics

### 1. Authentication (14 endpoints)
- **Admin**: Login, Profile
- **Student**: Register, Login, Profile, Update Profile
- **Teacher**: Register, Login, Pending Teachers, Approve Teacher
- **Email Verification**

### 2. Admin Management (3 endpoints)
- Bulk Upload Registration IDs
- Get All Registration IDs
- Delete Registration ID

### 3. Advisors (5 endpoints)
- Assign Advisor
- Get All Advisors
- Get My Students (Teacher)
- Get My Advisor (Student)
- Remove Advisor

### 4. Notices (6 endpoints)
- Create Notice
- Get Notices (with filters)
- Get Single Notice
- Update Notice
- Delete Notice
- Upload Notice Attachments (PDF)

### 5. Feedback (6 endpoints)
- Submit Feedback
- Get Course Feedback
- Get Teacher Feedback
- Get Feedback Stats
- Get Feedback with Identity (Admin)
- Delete Feedback

### 6. Results (6 endpoints)
- Upload Result (Manual)
- Upload Results (Excel)
- Get My Results (Student)
- Get Results by Session
- Get Student Results
- Delete Result

### 7. Admissions (9 endpoints)
- Create Admission
- Get All Admissions
- Get Single Admission
- Update Admission
- Delete Admission
- Submit Application (Public - No Auth!)
- Get Applications
- Approve Application
- Reject Application

### 8. Societies (8 endpoints)
- Create Society
- Get All Societies
- Get Single Society
- Update Society
- Delete Society
- Add Member
- Remove Member
- Get My Societies

### 9. Banners (7 endpoints)
- Create Banner
- Get Active Banners (Public)
- Get All Banners (Admin)
- Get Single Banner
- Update Banner
- Delete Banner
- Toggle Banner Status

### 10. Legacy Endpoints (6 endpoints)
- Faculty (Get All, Get Single)
- Courses (Get All, Get by Level)
- News (Get Active)
- Contact (Submit Form)

## Auto-Token Management

The collection includes **automatic token saving** for authentication endpoints:

- **Admin Login** → Saves to `{{adminToken}}`
- **Student Login** → Saves to `{{studentToken}}`
- **Teacher Login** → Saves to `{{teacherToken}}`

**How it works:**
Each login request has a "Tests" tab with JavaScript that extracts the token from the response and saves it to the environment.

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set('adminToken', jsonData.data.token);
}
```

## Testing Workflow

### Complete Flow Example:

1. **Admin Login**
   - `POST /api/auth/login`
   - Token auto-saved ✅

2. **Upload Registration IDs**
   - `POST /api/admin/registrations/bulk`
   - Uses `{{adminToken}}`

3. **Student Registers**
   - `POST /api/auth/student/register`
   - No auth needed

4. **Verify Email** (get token from server logs)
   - `GET /api/auth/verify-email/:token`

5. **Student Login**
   - `POST /api/auth/student/login`
   - Token auto-saved ✅

6. **Student Gets Profile**
   - `GET /api/auth/student/me`
   - Uses `{{studentToken}}`

7. **Admin Assigns Advisor**
   - `POST /api/advisors`
   - Uses `{{adminToken}}`

8. **Student Views Advisor**
   - `GET /api/advisors/my-advisor`
   - Uses `{{studentToken}}`

## Tips

### 1. View Environment Variables
- Click the eye icon (👁️) next to environment dropdown
- See all saved tokens and variables

### 2. Clear Tokens
- Click environment settings
- Manually clear token values if needed

### 3. Change Base URL
- Edit `baseUrl` in environment
- For production: `https://api.yourdomain.com`

### 4. Duplicate Requests
- Right-click any request → Duplicate
- Useful for testing with different data

### 5. Use Variables in Body
You can use variables in request bodies:
```json
{
  "teacherId": "{{teacherId}}",
  "session": "{{currentSession}}"
}
```

## File Upload Endpoints

### Notice Attachments
- `POST /api/notices/upload-attachments`
- Body type: `form-data`
- Key: `attachments` (type: File)
- Max 5 PDFs

### Result Upload (Excel)
- `POST /api/results/upload-excel`
- Body type: `form-data`
- Key: `file` (type: File)
- Additional fields: `session`, `semester`

## Common Issues

### Issue: 401 Unauthorized
**Solution:** Make sure you've logged in and the token is saved. Check environment variables.

### Issue: Token expired
**Solution:** Log in again to get a new token.

### Issue: BASE_URL not defined
**Solution:** Make sure "SUST AMS - Local" environment is selected.

### Issue: File upload not working
**Solution:** In Postman, body type must be `form-data`, not `raw`.

## Environment Variables

| Variable | Description | Auto-Saved |
|----------|-------------|------------|
| `baseUrl` | Server URL | No |
| `adminToken` | Admin JWT | Yes |
| `studentToken` | Student JWT | Yes |
| `teacherToken` | Teacher JWT | Yes |

## Total Endpoints: 60+

- **Public**: 15+ (no authentication required)
- **Protected**: 45+ (requires authentication)

## Support

For issues or questions:
1. Check server is running: http://localhost:5000/api/health
2. Check server logs for errors
3. Verify MongoDB is connected
4. Review API documentation in walkthrough.md

---

**Happy Testing!** 🚀
