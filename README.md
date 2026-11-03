# StudioSpace Server

Express and MongoDB API for the StudioSpace creative studio marketplace.

## Features
- Better Auth email/password registration and Google sign-in (Google credentials required).
- MongoDB collections for users, studios, and bookings.
- Studio create, read, update, delete, search, category filtering, and featured listing.
- HTTP-only JWT cookie for protected studio and booking mutations.
- Booking status management and confirmed-booking time-overlap checks.
- Friendly JSON error messages for the client toast notifications.

## Local setup
1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Add a MongoDB Atlas connection string and long random secrets.
5. Set `CLIENT_URL=http://localhost:3000` and `BETTER_AUTH_URL=http://localhost:5000`.
6. For Google sign-in, create OAuth credentials and add the client ID and secret.
7. Optional: run `npm run seed` once to add six sample studios to an empty database.\n8. Run `npm run dev`. The API uses port 5000.

## Main endpoints
- `GET /api/studios`, `GET /api/studios/:id`
- `POST /api/studios`, `PATCH /api/studios/:id`, `DELETE /api/studios/:id`
- `GET /api/studios/owner/mine`
- `POST /api/bookings`, `GET /api/bookings/mine`
- `PATCH /api/bookings/:id/cancel`, `PATCH /api/bookings/:id/confirm`
- Better Auth routes are mounted at `/api/auth`.

## Examiner test account
Create an account from the Register page. No fixed password is stored in this repository. Use your own examiner account and never commit real credentials.
