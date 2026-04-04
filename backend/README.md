# Farmer CRM Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/farmer_crm
JWT_SECRET=your-secret-key-here
PORT=3001
```

3. Push the database schema:
```bash
npm run db:push
```

4. Start the dev server:
```bash
npm run dev
```

## Deployment

Deploy to Railway, Fly.io, or Render:

1. Set the environment variables (DATABASE_URL, JWT_SECRET)
2. Build: `npm run build`
3. Start: `npm start`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/farmers | List farmers |
| POST | /api/farmers | Create farmer |
| GET | /api/farmers/:id | Get farmer |
| PUT | /api/farmers/:id | Update farmer |
| GET | /api/deliveries | List deliveries |
| POST | /api/deliveries | Record delivery |
| GET | /api/interactions | List interactions |
| POST | /api/interactions | Log interaction |
| GET | /api/complaints | List complaints |
| POST | /api/complaints | Log complaint |
| PATCH | /api/complaints/:id | Update complaint status |
| GET | /api/extension-visits | List visits |
| POST | /api/extension-visits | Log visit |
| GET | /api/dashboard/stats | Dashboard stats |

All endpoints except auth require `Authorization: Bearer <token>` header.
