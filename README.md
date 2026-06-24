# Mr & Miss FUL 2026 Voting Platform

Production-ready Next.js 15 voting platform for Federal University Lokoja's Mr & Miss FUL 2026 pageant.

## Key Features

- Premium mobile-first public voting page.
- Voting status badge: `Voting Open` or `Voting Closed`.
- Official voting state shown as a clear `Voting Open` or `Voting Closed` badge.
- Live podium leaderboard with center-first 3D effect.
- Contestant grid, shareable profile overlay, and URL profile detection.
- Paystack payment initialization and server-side verification.
- Supabase PostgreSQL schema, audit log, and realtime contestant updates.
- Admin dashboard shell for rankings, revenue, contestant management, payments, exports, and logs.
- Dynamic metadata, Open Graph, Twitter cards, and structured data.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in Supabase and Paystack keys.

4. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor.

5. Start locally:

```bash
npm run dev
```

## Voting Status

Set `NEXT_PUBLIC_VOTING_STATUS=open` to show `Voting Open`.
Set `NEXT_PUBLIC_VOTING_STATUS=closed` to show `Voting Closed` and block frontend payment starts.

## Security Model

The frontend never increments votes. The flow is:

1. User starts payment.
2. API creates a Paystack transaction.
3. Paystack returns a reference.
4. Callback page asks the backend to verify the reference.
5. Backend verifies with Paystack.
6. Backend rejects reused or invalid transactions.
7. Backend records payment.
8. Backend calls `process_verified_vote`.
9. Database increments votes and writes `vote_logs`.
10. Supabase Realtime updates all connected clients.

## Deployment

- Deploy to Vercel.
- Add all `.env.example` values in Vercel project settings.
- Configure Paystack callback URL as:

```text
https://your-domain.com/payment/complete
```

- Enable Supabase Realtime on the `contestants` table.
- Protect `/admin` with Supabase Auth middleware before launch.
