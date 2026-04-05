# Finance Dashboard Backend

A comprehensive Node.js backend for a finance dashboard system with role-based access control, financial records management, and dashboard analytics.

## Features

- **User & Role Management**: Three-tier role system (Viewer, Analyst, Admin) with permission-based access control
- **Financial Records Management**: Create, read, update, and delete (soft delete) financial transactions
- **Dashboard Analytics**: Real-time financial summaries, category breakdowns, and trend analysis
- **Pagination & Filtering**: Advanced filtering by date, category, type with configurable pagination
- **JWT Authentication**: Secure token-based authentication
- **Comprehensive Validation**: Input validation with detailed error messages
- **Centralized Error Handling**: Consistent error responses across all endpoints

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **CORS**: Express CORS

## Project Structure

```
src/
├── middleware/           # Authentication, authorization, error handling
├── routes/              # API route definitions
├── controllers/         # Request handling and response formatting
├── services/            # Business logic and data access
├── models/              # Database client
├── validators/          # Zod validation schemas
├── types/              # TypeScript interfaces and types
├── utils/              # Helper functions
├── constants/          # Enums and constants
└── index.ts            # Application entry point

prisma/
├── schema.prisma       # Database schema
└── seed.ts             # Seed data for testing
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Supabase recommended for cloud hosting)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"

# JWT Secret (generate a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server Port
PORT=3000

# Node Environment
NODE_ENV="development"
```

Copy `.env.example` for reference:

```bash
cp .env.example .env
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create and run migrations
npm run prisma:migrate

# Seed database with test data
npm run seed
```

## Running the Application

### Development (with auto-reload)

```bash
npm run dev:watch
```

### Production Build

```bash
npm run build
npm start
```

### Prisma Studio (database admin UI)

```bash
npm run prisma:studio
```

## API Documentation

### Authentication

All API endpoints (except `/api/auth/*`) require authentication. Include JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Base URL

```
http://localhost:3000/api
```

## API Endpoints

### 1. Authentication (`/auth`)

#### Login

- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "name": "User Name",
        "role": "ANALYST",
        "status": "ACTIVE",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

#### Register

- **Endpoint**: `POST /auth/register`
- **Description**: Register new user (default role: VIEWER)
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User"
  }
  ```
- **Response**: Same as login (returns user without token)

### 2. User Management (`/users`)

#### Get User Profile

- **Endpoint**: `GET /users/:id`
- **Auth Required**: Yes
- **Description**: Get user details by ID
- **Response**: User object

#### Update User Profile

- **Endpoint**: `PUT /users/:id`
- **Auth Required**: Yes
- **Description**: Update user information (own profile or admin)
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "password": "newpassword123",
    "role": "ANALYST",
    "status": "ACTIVE"
  }
  ```

#### List All Users (Admin Only)

- **Endpoint**: `GET /users`
- **Auth Required**: Yes (Admin)
- **Description**: List all users with pagination
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
- **Response**: Paginated list of users

#### Create User (Admin Only)

- **Endpoint**: `POST /users`
- **Auth Required**: Yes (Admin)
- **Description**: Create new user account
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New User",
    "role": "VIEWER"
  }
  ```

#### Deactivate User (Admin Only)

- **Endpoint**: `DELETE /users/:id`
- **Auth Required**: Yes (Admin)
- **Description**: Deactivate user account (soft delete)

#### User Statistics (Admin Only)

- **Endpoint**: `GET /users/admin/statistics`
- **Auth Required**: Yes (Admin)
- **Description**: Get user statistics
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 10,
      "activeUsers": 9,
      "inactiveUsers": 1,
      "byRole": {
        "VIEWER": 5,
        "ANALYST": 3,
        "ADMIN": 2
      }
    }
  }
  ```

### 3. Financial Records (`/records`)

#### Create Record

- **Endpoint**: `POST /records`
- **Auth Required**: Yes (Analyst+)
- **Description**: Create new financial record
- **Request Body**:
  ```json
  {
    "amount": 100.5,
    "type": "EXPENSE",
    "category": "Food & Dining",
    "date": "2024-01-15T10:30:00Z",
    "notes": "Lunch at cafe"
  }
  ```
- **Response**: Created record object

#### Get Records

- **Endpoint**: `GET /records`
- **Auth Required**: Yes
- **Description**: List financial records with pagination and filtering
- **Query Parameters**:
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `type` (INCOME or EXPENSE, optional)
  - `category` (string, optional)
  - `startDate` (ISO datetime, optional)
  - `endDate` (ISO datetime, optional)
  - `sortBy` (date or amount, default: date)
  - `sortOrder` (asc or desc, default: desc)
- **Response**: Paginated list of records

Example:

```
GET /records?page=1&limit=20&type=EXPENSE&category=Food&sortBy=amount&sortOrder=desc
```

#### Get Record by ID

- **Endpoint**: `GET /records/:id`
- **Auth Required**: Yes
- **Description**: Get specific record details
- **Access Control**: Users can only view their own records (admins view all)

#### Update Record

- **Endpoint**: `PUT /records/:id`
- **Auth Required**: Yes (Analyst+)
- **Description**: Update financial record
- **Request Body**: Any of the create fields (all optional)
- **Access Control**: Users can only update their own records (admins update all)

#### Delete Record

- **Endpoint**: `DELETE /records/:id`
- **Auth Required**: Yes (Analyst+)
- **Description**: Soft delete financial record
- **Access Control**: Users can only delete their own records (admins delete all)

#### Category Statistics

- **Endpoint**: `GET /records/statistics/categories`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (ISO datetime, optional)
  - `endDate` (ISO datetime, optional)
- **Description**: Get expense breakdown by category

### 4. Dashboard Analytics (`/dashboard`)

#### Dashboard Summary

- **Endpoint**: `GET /dashboard/summary`
- **Auth Required**: Yes
- **Query Parameters**:
  - `months` (default: 1) - Number of months to include
- **Description**: Get overall financial summary
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "totalIncome": 5000,
      "totalExpenses": 1500,
      "netBalance": 3500,
      "recordCount": 45,
      "period": {
        "startDate": "2024-01-01T00:00:00Z",
        "endDate": "2024-01-31T23:59:59Z"
      }
    }
  }
  ```

#### Category Breakdown

- **Endpoint**: `GET /dashboard/category-breakdown`
- **Auth Required**: Yes
- **Query Parameters**:
  - `months` (default: 1)
- **Description**: Get expense breakdown by category
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "category": "Food & Dining",
        "total": 450,
        "percentage": 30,
        "recordCount": 9
      }
    ]
  }
  ```

#### Monthly Trends

- **Endpoint**: `GET /dashboard/monthly-trend`
- **Auth Required**: Yes
- **Query Parameters**:
  - `months` (default: 12)
- **Description**: Get monthly income/expense trends
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "month": "January",
        "year": 2024,
        "income": 5000,
        "expenses": 1500,
        "balance": 3500
      }
    ]
  }
  ```

#### Recent Activity

- **Endpoint**: `GET /dashboard/recent-activity`
- **Auth Required**: Yes
- **Query Parameters**:
  - `limit` (default: 10) - Number of recent transactions
- **Description**: Get recent transactions

#### Income vs Expenses

- **Endpoint**: `GET /dashboard/income-vs-expenses`
- **Auth Required**: Yes
- **Query Parameters**:
  - `months` (default: 12)
- **Description**: Compare total income vs expenses

#### Top Spending Categories

- **Endpoint**: `GET /dashboard/top-spending`
- **Auth Required**: Yes
- **Query Parameters**:
  - `limit` (default: 5)
  - `months` (default: 1)
- **Description**: Get top spending categories

## Role-Based Access Control

### Roles and Permissions

| Feature            | Viewer | Analyst | Admin |
| ------------------ | ------ | ------- | ----- |
| View own records   | ✓      | ✓       | ✓     |
| View all records   | ✗      | ✗       | ✓     |
| Create records     | ✗      | ✓       | ✓     |
| Update own records | ✗      | ✓       | ✓     |
| Update any record  | ✗      | ✗       | ✓     |
| Delete own records | ✗      | ✓       | ✓     |
| Delete any record  | ✗      | ✗       | ✓     |
| View dashboard     | ✓      | ✓       | ✓     |
| Manage users       | ✗      | ✗       | ✓     |

## Test Data

The seed script creates test accounts:

- **Admin**: admin@finance.com / admin123
- **Analyst**: analyst@finance.com / analyst123
- **Viewer**: viewer@finance.com / viewer123

Sample financial records are created for testing.

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input data
- `CONFLICT` - Resource already exists
- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_ALREADY_EXISTS` - Email already registered
- `RECORD_NOT_FOUND` - Financial record not found
- `INTERNAL_SERVER_ERROR` - Server error

## Validation

All inputs are validated using Zod schemas. Validation errors include field-level details:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "BAD_REQUEST",
  "details": [
    {
      "path": "amount",
      "message": "Amount must be greater than 0"
    }
  ]
}
```

## Database Schema

### User

- `id`: Unique identifier
- `email`: Unique email address
- `password`: Hashed password
- `name`: User name
- `role`: VIEWER, ANALYST, or ADMIN
- `status`: ACTIVE or INACTIVE
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### FinancialRecord

- `id`: Unique identifier
- `userId`: Foreign key to User
- `amount`: Transaction amount (Decimal)
- `type`: INCOME or EXPENSE
- `category`: Category string
- `date`: Transaction date
- `notes`: Optional notes
- `isDeleted`: Soft delete flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### AuditLog

- `id`: Unique identifier
- `userId`: Foreign key to User
- `action`: Action type
- `entityType`: Entity type (e.g., USER, RECORD)
- `entityId`: Entity identifier
- `timestamp`: Action timestamp

## Deployment

### Deploy to Render with Supabase

1. **Create Database on Supabase**
   - Go to supabase.com and create a PostgreSQL database
   - Go to Project Settings → Database → Connection String
   - Copy the connection string (STDBY or Direct connection)

2. **Deploy to Render**
   - Push code to GitHub
   - Connect Render to GitHub repository (render.com)
   - Create Web Service with settings:
     - **Build Command**: `npm install --include=dev && npm run prisma:generate && npm run build`
     - **Start Command**: `npm run prisma:migrate -- --skip-generate && npm run seed && npm start`
   - Add environment variables:
     - `DATABASE_URL`: Your Supabase connection string
     - `JWT_SECRET`: Strong random string
     - `NODE_ENV`: "production"
     - `PORT`: 3000

3. **Migrations Run Automatically**
   - Migrations and seeding run on service startup
   - No manual migration steps needed
   - Your backend will be live at: `https://your-service-name.onrender.com`

## Development Assumptions

1. **Authentication**: Mock JWT implementation suitable for development/demo
2. **Database**: PostgreSQL with Prisma ORM
3. **Soft Deletes**: Financial records use soft delete for data integrity
4. **Pagination**: Limit/offset based pagination
5. **Access Control**: Role-based with middleware and service-layer enforcement
6. **Error Handling**: Centralized error middleware with consistent response format

## Troubleshooting

### Database Connection Issues

- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Test connection: `npm run prisma:studio`

### Seed Failed

- Ensure database is migrated: `npm run prisma:migrate`
- Clear data and retry: `npx prisma db seed`

### Port Already in Use

- Change `PORT` in `.env`
- Or kill process: `lsof -i :3000 | kill <PID>`

## API Testing

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get all records (with token)
curl -X GET http://localhost:3000/api/records \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Create a new collection
2. Set base URL: `http://localhost:3000/api`
3. Create POST request to `/auth/login` with credentials
4. Copy token from response
5. In Postman settings, add token to Authorization header
6. Test other endpoints

## Performance Considerations

- **Pagination**: Always use pagination for list endpoints
- **Indexes**: Database indexes on userId, date, type for fast queries
- **Caching**: Can be added later with Redis
- **Rate Limiting**: Can be added with express-rate-limit

## Future Enhancements

- Advanced search/full-text search
- Audit logging with detailed change tracking
- Rate limiting per user/IP
- Swagger/OpenAPI documentation
- Unit and integration tests
- Two-factor authentication
- Export to CSV/PDF functionality
- Bulk operations API
- WebSocket support for real-time updates

## License

MIT

## Support

For issues or questions, please refer to the GitHub repository or contact the maintainers.
