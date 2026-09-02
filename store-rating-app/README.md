# Store Rating Application

A full-stack web application where users can submit ratings (1 to 5) for stores
registered on the platform. Built as a beginner-level internship coding
assessment project.

## 1. Project Description

There is a single login system for three roles:

- **System Administrator** - manages users and stores, views dashboard stats.
- **Normal User** - signs up, browses stores, submits/modifies ratings.
- **Store Owner** - views their store's average rating and who rated it.

## 2. Technologies Used

- **Frontend:** React.js (built with Vite), plain CSS, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken), bcrypt for password hashing

## 3. Requirements / Prerequisites

- Node.js (v18 or later recommended)
- PostgreSQL (v14 or later recommended)
- npm

## 4. PostgreSQL Database Setup

1. Make sure PostgreSQL is running.
2. Create a database:
   ```bash
   psql -U postgres -c "CREATE DATABASE store_rating_db;"
   ```

## 5. Environment Variables

Backend configuration lives in `backend/.env`.
`.env` contains:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/store_rating_db
JWT_SECRET=change_this_to_a_long_random_secret
PORT=5000
```

Do not commit your real `.env` file.

## 6. Backend Installation

```bash
cd backend
npm install
```

Create the database tables:

```bash
node database/migrate.js
```

Insert demo/seed data (optional but recommended for testing):

```bash
node database/seed.js
```

## 7. Frontend Installation

```bash
cd frontend
npm install
```

## 8. How to Start the Backend

```bash
cd backend
npm start
```

The API will run at `http://localhost:5000`.

## 9. How to Start the Frontend

```bash
cd frontend
npm run dev
```

The app will open at `http://localhost:5173`. It talks to the backend at
`http://localhost:5000` (see `frontend/src/api/api.js` if you need to change
this URL).

## 10. Database Setup / Seed Instructions

Run `node database/migrate.js` once to create the `users`, `stores`, and
`ratings` tables. Run `node database/seed.js` any time to reset the database
back to a small set of demo records (it clears old data first).

## 11. Test Login Credentials

After seeding, you can log in with:

| Role         | Email               | Password    |
|--------------|---------------------|-------------|
| Admin        | admin@example.com   | Admin@123   |
| Store Owner  | owner@example.com   | Owner@123   |
| Normal User  | rahul@example.com   | User@123    |

You can also sign up a brand-new Normal User from the Sign Up page.

## 12. The Three Roles, in Short

- **Admin** adds stores and users, and sees platform-wide stats
  (total users, total stores, total ratings), with search/sort on the
  listings.
- **Normal User** signs up, browses/searches stores, and can rate each
  store once (rating 1-5). Rating again on the same store updates the
  existing rating instead of creating a new one.
- **Store Owner** sees their own store's average rating and the list of
  users who rated it - nothing about other stores.

## Project Structure

```
store-rating-app/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js               # PostgreSQL connection pool
│   ├── validators.js       # Shared backend validation rules
│   ├── database/
│   │   ├── schema.sql       # Table definitions
│   │   ├── migrate.js       # Runs schema.sql
│   │   └── seed.js          # Inserts demo data
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── ratingRoutes.js
│   │   └── dashboardRoutes.js
│   └── middleware/
│       ├── authMiddleware.js
│       └── roleMiddleware.js
└── frontend/
    └── src/
        ├── api/api.js            # fetch() wrapper
        ├── context/AuthContext.jsx
        ├── components/           # Navbar, ProtectedRoute, StarRating
        └── pages/                # One file per screen
```

## Database Schema

- **users**(id, name, email, password, address, role, created_at)
  role is one of ADMIN, USER, STORE_OWNER.
- **stores**(id, name, email, address, owner_id, created_at)
  owner_id references users(id).
- **ratings**(id, user_id, store_id, rating, created_at, updated_at)
  UNIQUE(user_id, store_id) so a user can only rate a store once.

## API Endpoints

```
POST   /api/auth/register          Sign up (Normal User only)
POST   /api/auth/login             Login (all roles)

GET    /api/users                  List users (Admin, supports filter/sort)
GET    /api/users/:id              User details (Admin)
POST   /api/users                  Create user (Admin)
PUT    /api/users/password         Change own password (any logged-in user)

GET    /api/stores                 List stores (Admin/User, supports filter/sort)
GET    /api/stores/:id             Store details
POST   /api/stores                 Create store (Admin)
GET    /api/stores/owner/dashboard Store Owner's dashboard

POST   /api/ratings                Submit a rating (Normal User)
PUT    /api/ratings/:id            Modify own rating (Normal User)

GET    /api/dashboard/stats        Admin dashboard statistics
```

## Authentication Flow

1. User logs in via `POST /api/auth/login` with email + password.
2. Backend checks the password against the bcrypt hash in the database.
3. If correct, backend signs a JWT containing `{ id, role }` and returns it.
4. Frontend stores the token in `localStorage` and sends it as
   `Authorization: Bearer <token>` on every subsequent request.
5. `authMiddleware.js` verifies the token on protected routes.

## Role-Based Authorization

`roleMiddleware.js` checks `req.user.role` (set by `authMiddleware`) against
the roles allowed for that route. For example, `GET /api/users` requires
`requireRole("ADMIN")`, so a Normal User hitting that URL directly gets a
403 response even with a valid token.

## How Each Requirement Was Implemented

- **Single login, 3 roles:** one `users` table with a `role` column; one
  `/api/auth/login` endpoint for everyone.
- **Admin dashboard stats:** `GET /api/dashboard/stats` counts rows in
  `users`, `stores`, and `ratings`.
- **Filtering/sorting:** implemented with SQL `WHERE ... ILIKE` and
  `ORDER BY` clauses in `userRoutes.js` / `storeRoutes.js`, driven by query
  parameters from the frontend's search/sort UI.
- **One rating per user per store:** enforced both by a `UNIQUE(user_id,
  store_id)` database constraint and an application-level check before
  inserting.
- **Password security:** bcrypt hashing on signup/creation, hashes are
  never returned in API responses.
- **Validation:** the same rules (name length, password rules, email
  format, rating range) are checked on the frontend for instant feedback
  and re-checked on the backend so the API can't be bypassed.

## Testing Performed

Before delivery, the following were manually verified end-to-end against a
running PostgreSQL instance:

- Backend starts and connects to PostgreSQL successfully.
- Signup with valid and invalid data (name length, email format).
- Login for Admin, Store Owner, and Normal User.
- Admin: dashboard stats, list/filter/sort users and stores, view user
  details (including a store owner's rating).
- Normal User: view stores with search, submit a rating, attempt a
  duplicate rating (rejected), modify an existing rating, reject an
  out-of-range rating value.
- Store Owner: dashboard shows only their own store and its raters.
- Role-based authorization: a Normal User and a Store Owner both get a 403
  when calling Admin-only endpoints.
- Password change with wrong current password (rejected) and correct flow
  (accepted, can log in with new password).
- Frontend builds successfully with `npm run build` with no errors.
