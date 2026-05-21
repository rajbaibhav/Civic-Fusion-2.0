# CivicFusion Backend

A complete, production-grade backend for CivicFusion - a civic governance platform that enables citizens to monitor public projects, budgets, and participate in transparent governance.

## Features

- **Authentication**: Email + Password + JWT (stateless)
- **User Management**: Role-based access control (citizen, volunteer, official, admin)
- **Project Management**: Full lifecycle with status tracking and progress history
- **Budget Transparency**: Track allocations, spending, and audit trails
- **Citizen Participation**: Comments and issue/grievance system
- **Admin Dashboard**: User management, moderation, and platform statistics

## Tech Stack

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- ES Modules

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicfusion
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (citizen/volunteer only)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (client-side token discard)

### User Management
- `GET /api/users/profile` - Get own profile (authenticated)
- `PUT /api/users/profile` - Update own profile (authenticated)
- `PUT /api/users/deactivate` - Deactivate own account (authenticated)

### Admin Routes
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/role` - Assign role
- `PUT /api/admin/users/:id/block` - Block user
- `PUT /api/admin/users/:id/unblock` - Unblock user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user
- `PUT /api/admin/users/:id/reactivate` - Reactivate user
- `DELETE /api/admin/comments/:id` - Delete any comment
- `GET /api/admin/stats` - Get platform statistics

### Projects
- `GET /api/projects` - List all projects (public)
- `GET /api/projects/:id` - Get project details (public)
- `POST /api/projects` - Create project (official/admin)
- `PUT /api/projects/:id` - Update project (official/admin)
- `PUT /api/projects/:id/status` - Update status (official/admin)
- `PUT /api/projects/:id/progress` - Update progress (official/admin)
- `PUT /api/projects/:id/archive` - Archive project (official/admin)

### Budgets
- `GET /api/budgets/project/:projectId` - Get budget (public)
- `GET /api/budgets/project/:projectId/history` - Get budget history (public)
- `POST /api/budgets/project/:projectId` - Add budget (official/admin)
- `PUT /api/budgets/project/:projectId` - Update budget (official/admin)

### Comments
- `GET /api/comments/project/:projectId` - Get comments (public)
- `POST /api/comments/project/:projectId` - Add comment (authenticated)
- `PUT /api/comments/:id` - Update own comment (authenticated)
- `DELETE /api/comments/:id` - Delete own comment (authenticated) or any (admin)

### Issues
- `GET /api/issues` - List all issues (public)
- `GET /api/issues/:id` - Get issue details (public)
- `POST /api/issues/project/:projectId` - Create issue (authenticated)
- `PUT /api/issues/:id/status` - Update status (official/admin)
- `POST /api/issues/:id/respond` - Respond to issue (official/admin)
- `POST /api/issues/:id/escalate` - Escalate issue (authenticated)

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Roles

- **citizen**: Can view projects, add comments, raise issues
- **volunteer**: Same as citizen
- **official**: Can create/manage projects, budgets, respond to issues
- **admin**: Full access including user management and moderation

## Error Handling

All errors are logged to the console and returned with appropriate HTTP status codes. Error messages are user-friendly and don't expose sensitive information.

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User profile management
│   ├── adminController.js   # Admin operations
│   ├── projectController.js # Project CRUD
│   ├── budgetController.js  # Budget management
│   ├── commentController.js # Comment system
│   └── issueController.js   # Issue/grievance system
├── middleware/
│   └── auth.js              # JWT authentication & authorization
├── models/
│   ├── User.js              # User schema
│   ├── Project.js           # Project schema
│   ├── Budget.js            # Budget schema
│   ├── Comment.js           # Comment schema
│   └── Issue.js             # Issue schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── userRoutes.js        # User endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── projectRoutes.js     # Project endpoints
│   ├── budgetRoutes.js      # Budget endpoints
│   ├── commentRoutes.js     # Comment endpoints
│   └── issueRoutes.js       # Issue endpoints
├── utils/
│   └── jwt.js               # JWT utilities
├── server.js                # Main server file
└── package.json
```

## Notes

- All passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- Progress and budget changes are tracked in history
- Comments are soft-deleted (isDeleted flag)
- Projects can be archived (not deleted)
- All timestamps are automatically managed by Mongoose

## License

ISC
