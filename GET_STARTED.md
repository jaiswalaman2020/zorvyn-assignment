# 🚀 Quick Start Guide - Finance Dashboard Backend

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Your Supabase PostgreSQL connection string (in `.env`)

## Step-by-Step Instructions

### 1. Install Dependencies (if not already done)

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations

Creates all required tables in your Supabase database:

```bash
npm run prisma:migrate
```

When prompted, give your migration a name like: `init`

### 4. Seed Test Data

Populates database with test users and sample financial records:

```bash
npm run seed
```

You should see output like:

```
Seeding database...
Users created: { admin: '...', analyst: '...', viewer: '...' }
Sample financial records created
Seed completed successfully!
```

### 5. Start Development Server

Runs with auto-reload on file changes:

```bash
npm run dev:watch
```

You should see:

```
Server running on port 3000
Node environment: development
```

### 6. Test the API

In another terminal, test a simple endpoint:

```bash
# Health check
curl http://localhost:3000/health
```

Expected response:

```json
{ "status": "OK", "timestamp": "2024-04-04T21:00:00.000Z" }
```

## 🔐 Authentication & Testing

### Get Access Token (Login)

```bash
# Login as Analyst
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@finance.com",
    "password": "analyst123"
  }' | jq -r '.data.token')

echo "Token: $TOKEN"
```

### Test Protected Endpoint

```bash
# Get all financial records (paginated)
curl -X GET "http://localhost:3000/api/records?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### Create a Financial Record

```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "type": "EXPENSE",
    "category": "Food & Dining",
    "date": "2024-04-04T10:30:00Z",
    "notes": "Lunch at cafe"
  }'
```

### Get Dashboard Summary

```bash
curl -X GET "http://localhost:3000/api/dashboard/summary?months=1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## 👥 Test User Credentials

| Role    | Email               | Password   |
| ------- | ------------------- | ---------- |
| Admin   | admin@finance.com   | admin123   |
| Analyst | analyst@finance.com | analyst123 |
| Viewer  | viewer@finance.com  | viewer123  |

### Role Permissions

- **Viewer**: Can only view dashboard and records (read-only)
- **Analyst**: Can create/update/delete own records, view data
- **Admin**: Full access to everything including user management

## 📊 Available API Endpoints

### Authentication

- `POST /api/auth/login` - Get JWT token
- `POST /api/auth/register` - Register new user

### Financial Records

- `POST /api/records` - Create record (Analyst+)
- `GET /api/records` - List records with filtering
- `GET /api/records/:id` - Get specific record
- `PUT /api/records/:id` - Update record (Analyst+)
- `DELETE /api/records/:id` - Delete record (Analyst+)

### Dashboard

- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/category-breakdown` - Spending by category
- `GET /api/dashboard/monthly-trend` - Monthly trends
- `GET /api/dashboard/recent-activity` - Recent transactions
- `GET /api/dashboard/income-vs-expenses` - Income vs expenses
- `GET /api/dashboard/top-spending` - Top spending categories

### User Management (Admin only)

- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

## 🧪 Quick Test with Postman

1. Open Postman
2. Set base URL to `http://localhost:3000/api`
3. Login at `POST /auth/login` with credentials above
4. Copy the token from response
5. In Postman, go to Auth tab → Bearer Token → Paste token
6. Test any endpoint!

## 📝 Build & Production

### Build TypeScript

```bash
npm run build
```

Creates optimized code in `dist/` folder

### Run Production Build

```bash
npm start
```

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED
```

**Solution**: Verify your `DATABASE_URL` in `.env` is correct from Supabase dashboard
- Go to Supabase Project Settings → Database → Connection String
- Make sure the connection string includes password and database name

### Migration Error

```
Error: ENOENT: no such file or directory, open '.env'
```

**Solution**: Make sure `.env` file exists with DATABASE_URL

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:

```bash
# Kill process on port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3001 npm run dev:watch
```

## 📚 Full Documentation

See `README.md` for:

- Detailed API documentation
- Access control rules
- Schema design
- Deployment instructions
- Additional features

## 🚢 Deploy to Railway

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Add environment variables:
   - `DATABASE_URL` - Your Supabase connection string (from Project Settings → Database → Connection String)
   - `JWT_SECRET` - Generate strong random string
   - `NODE_ENV` - Set to "production"
   - `PORT` - Railway will set this automatically

That's it! Your backend is deployed! 🎉
