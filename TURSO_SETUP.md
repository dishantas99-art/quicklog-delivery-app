# Turso Database Integration Guide

## Overview

Turso is a SQLite-compatible database service that runs globally at the edge. This guide shows how to set up Turso and connect QuickLog's receipt data to persistent cloud storage.

## Step 1: Create Turso Account

1. Go to https://turso.tech
2. Click **Sign Up**
3. Create account (GitHub, Google, or email)
4. Verify email
5. You'll be taken to the dashboard

## Step 2: Create Your First Database

1. On Turso dashboard, click **Create Database**
2. Set **Database Name**: `quicklog-delivery`
3. Select **Region**: Choose closest to your location
4. Click **Create**
5. Wait for database to be created (usually <1 minute)

## Step 3: Get Database Credentials

1. Click on your database name
2. Go to **Overview** tab
3. Copy the following:
   - **Database URL** (looks like: `libsql://xxxxx.turso.io`)
   - **Auth Token** (keep this private!)

## Step 4: Configure Environment Variables

Add Turso credentials to your `.env` file:

```bash
TURSO_CONNECTION_URL=libsql://xxxxx.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
```

Or use the Manus webdev secrets interface to set these securely.

## Step 5: Create Database Schema

The database schema is already defined in `drizzle/schema.ts`. It includes tables for:

- **users**: Staff members and admins
- **receipts**: Delivery receipts with items and images
- **receipt_items**: Line items in each receipt
- **sync_queue**: Tracks unsynced changes for offline support

To initialize the schema in your Turso database:

```bash
npm run db:push
```

This command:
1. Generates migration files
2. Applies migrations to Turso database
3. Creates all necessary tables

## Step 6: Create API Endpoints

The backend server (`server/_core/index.ts`) provides these endpoints:

### Receipt Endpoints

```
POST   /api/receipts              - Create receipt
GET    /api/receipts              - List all receipts (admin)
GET    /api/receipts/:id          - Get receipt details
PUT    /api/receipts/:id          - Update receipt
DELETE /api/receipts/:id          - Delete receipt
GET    /api/receipts/staff/:id    - List staff's receipts
```

### Staff Endpoints

```
POST   /api/staff                 - Create staff member
GET    /api/staff                 - List all staff
GET    /api/staff/:id             - Get staff details
PUT    /api/staff/:id             - Update staff
DELETE /api/staff/:id             - Delete staff
```

### Sync Endpoints

```
POST   /api/sync                  - Sync offline changes
GET    /api/sync/status           - Get sync status
```

## Step 7: Connect Frontend to Backend

The receipt context (`lib/receipt-context.tsx`) already includes sync logic. When online, receipts are automatically synced to Turso.

### Sync Flow

```
1. Staff creates receipt (saved locally to AsyncStorage)
2. Receipt added to sync queue
3. When online, sync function runs automatically
4. Receipts uploaded to Turso database
5. Admin dashboard fetches data from Turso
```

## Step 8: Test Database Connection

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Log in as Admin
3. Create a receipt as Staff
4. Check Turso dashboard for data:
   - Go to **Database** → **Browser**
   - Query: `SELECT * FROM receipts;`
   - You should see your receipt!

## Turso Dashboard Features

| Feature | Use |
|---------|-----|
| **Browser** | Query and view database tables |
| **Backups** | Automatic daily backups |
| **Replication** | Replicate database to multiple regions |
| **Metrics** | Monitor queries and performance |
| **Settings** | Manage auth tokens and access |

## Database Schema Overview

### receipts table

```sql
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  staffId TEXT NOT NULL,
  customerName TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  totalAmount REAL NOT NULL,
  notes TEXT,
  images TEXT, -- JSON array of image URLs
  synced BOOLEAN DEFAULT 0,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### receipt_items table

```sql
CREATE TABLE receipt_items (
  id TEXT PRIMARY KEY,
  receiptId TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (receiptId) REFERENCES receipts(id)
);
```

### staff table

```sql
CREATE TABLE staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  status TEXT DEFAULT 'active',
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Offline Sync Strategy

QuickLog uses a **local-first** approach:

1. **Create locally**: Receipts saved to AsyncStorage immediately
2. **Queue for sync**: Added to sync_queue table
3. **Sync when online**: Automatic sync to Turso
4. **Conflict resolution**: Server timestamp wins

This ensures:
- ✅ App works offline
- ✅ No data loss
- ✅ Automatic sync when reconnected
- ✅ Admin sees latest data

## Advanced: Replication

For global performance, replicate your database:

1. Go to **Settings** → **Replication**
2. Click **Add Replica**
3. Select regions (e.g., Asia, Europe, Americas)
4. Turso automatically syncs data across regions

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Connection fails** | Check `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN` are correct. Verify database exists in Turso dashboard. |
| **Schema not created** | Run `npm run db:push` to apply migrations. Check console for errors. |
| **Data not syncing** | Check network connection. Verify sync queue is running. Check server logs. |
| **Slow queries** | Add indexes on frequently queried columns. Check Turso metrics for bottlenecks. |

## Cost Considerations

Turso's free tier includes:
- **3 databases**
- **9 GB total storage**
- **Unlimited reads**
- **1 million writes/month**

This is sufficient for small to medium deployments. See https://turso.tech/pricing for details.

## Next Steps

1. ✅ Create Turso account and database
2. ✅ Configure environment variables
3. ✅ Run migrations (`npm run db:push`)
4. ✅ Test receipt sync
5. **→ Deploy to production** (see `DEPLOYMENT.md`)

## Useful Commands

```bash
# Initialize database schema
npm run db:push

# Generate new migrations
npm run db:generate

# View database in browser
# Go to Turso dashboard → Database → Browser

# Check sync status
curl http://localhost:3000/api/sync/status

# Query receipts
curl http://localhost:3000/api/receipts
```

---

**Questions?** Check [Turso Documentation](https://docs.turso.tech) or [LibSQL Reference](https://docs.turso.tech/libsql).
