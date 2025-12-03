# SOWAL Renovations Backend

Next.js API backend for SOWAL Renovations app with PostgreSQL and Twilio SMS.

## Quick Deploy to Vercel

1. Push this folder to GitHub
2. Import to Vercel
3. Add environment variables (see below)
4. Deploy

## Environment Variables

Add these in Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/sowal_db
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
NOTIFY_PHONE_NUMBER=+18505557692
```

## Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard → Storage → Create Database → Postgres
2. It auto-adds DATABASE_URL to your project
3. Run schema manually in the Vercel Postgres console using `lib/schema.sql`

### Option 2: External PostgreSQL (Neon, Supabase, Railway)
1. Create database on your provider
2. Copy connection string to DATABASE_URL
3. Run: `npm run db:setup`

## Twilio Setup

1. Create account at twilio.com
2. Get a phone number (~$1/month)
3. Copy Account SID, Auth Token, and Phone Number to env vars
4. Set NOTIFY_PHONE_NUMBER to where you want alerts sent

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Quick inquiry from home page |
| POST | `/api/request-now` | Urgent request (sends SMS immediately) |
| POST | `/api/bookings` | Create scheduled booking |
| GET | `/api/bookings` | List all bookings |
| GET | `/api/bookings?upcoming=true` | List upcoming bookings |
| PATCH | `/api/bookings` | Update booking status |

## Request Examples

### Quick Inquiry
```json
POST /api/contact
{
  "name": "John Smith",
  "phone": "850-555-1234",
  "message": "Need help with kitchen faucet"
}
```

### Urgent Request
```json
POST /api/request-now
{
  "serviceDescription": "Leaky pipe flooding bathroom!",
  "phone": "850-555-1234"
}
```

### Create Booking
```json
POST /api/bookings
{
  "serviceDescription": "Install ceiling fans in 2 bedrooms",
  "date": "2024-12-15",
  "time": "10:00 AM",
  "name": "John Smith",
  "phone": "850-555-1234",
  "email": "john@example.com"
}
```

### Update Booking Status
```json
PATCH /api/bookings
{
  "id": 1,
  "status": "confirmed"
}
```

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

## Costs

- **Vercel**: Free tier covers most small business needs
- **Vercel Postgres**: Free tier = 256MB storage
- **Twilio**: ~$1/month for phone number + $0.0079/SMS
