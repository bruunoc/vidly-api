# Vidly API

A REST API for a fictional movie rental store. It manages genres, movies, customers, rentals and returns, with user registration, JWT authentication and role-based access (admin).

Built while following Mosh Hamedani's Node.js course, then extended and deployed by me, including the full test suite, a generic validation middleware and ObjectId validation on every `/:id` route.

**Live API:** https://vidly-api-i6px.onrender.com/api/genres

> Hosted on Render's free plan: the server sleeps after ~15 minutes without traffic, so the **first request can take 30–60 seconds** to respond.

---

## Tech stack

| Area | Tools |
|---|---|
| Runtime / framework | Node.js 24, Express 5 |
| Database | MongoDB Atlas, Mongoose |
| Validation | Joi, joi-objectid |
| Authentication | JSON Web Tokens (jsonwebtoken), bcrypt |
| Logging | Winston (console, file and MongoDB transports) |
| Security / performance | Helmet, compression |
| Configuration | config (per-environment settings + environment variables) |
| Testing | Jest, Supertest |
| Deployment | Render (API), MongoDB Atlas (database), GitHub (auto-deploy on push) |

---

## Features

- **CRUD** for genres and customers; create and list for movies and rentals
- **Returns** flow: sets the return date, calculates the rental fee and puts the movie back in stock
- **Authentication** with JWT sent in the `x-auth-token` header
- **Authorization**: only admins can delete genres
- **Input validation** with Joi, returning `400` with a clear message
- **ObjectId validation** on every `/:id` route, returning `404` instead of a server error
- **Centralized error handling** and logging of uncaught exceptions and unhandled rejections
- **Passwords hashed** with bcrypt, never returned in responses
- **Secrets in environment variables**, never in the code

---

## API endpoints

Base URL: `https://vidly-api-i6px.onrender.com`

🔒 = requires a valid token in the `x-auth-token` header · 👑 = requires an admin user

### Users and authentication

| Method | Route | Description | Access |
|---|---|---|---|
| POST | `/api/users` | Register a user. Returns the token in the `x-auth-token` response header | Public |
| GET | `/api/users/me` | Get the logged-in user (without password) | 🔒 |
| POST | `/api/auth` | Log in with email and password. Returns a JWT | Public |

### Genres

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/genres` | List all genres | Public |
| GET | `/api/genres/:id` | Get one genre | Public |
| POST | `/api/genres` | Create a genre | 🔒 |
| PUT | `/api/genres/:id` | Update a genre | 🔒 |
| DELETE | `/api/genres/:id` | Delete a genre | 🔒 👑 |

### Customers

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/customers` | List all customers | Public |
| GET | `/api/customers/:id` | Get one customer | Public |
| POST | `/api/customers` | Create a customer | 🔒 |
| PUT | `/api/customers/:id` | Update a customer | 🔒 |
| DELETE | `/api/customers/:id` | Delete a customer | 🔒 |

### Movies

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/movies` | List all movies | Public |
| POST | `/api/movies` | Create a movie | 🔒 |

### Rentals and returns

| Method | Route | Description | Access |
|---|---|---|---|
| GET | `/api/rentals` | List all rentals | Public |
| POST | `/api/rentals` | Rent a movie (decreases the stock) | 🔒 |
| POST | `/api/returns` | Return a rental (sets return date, calculates fee, increases the stock) | 🔒 |

### Example requests

**Register a user**

```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "12345"
}
```

**Create a genre** (using the token from the register/login response)

```http
POST /api/genres
Content-Type: application/json
x-auth-token: <your JWT>

{
  "name": "Comedy"
}
```

**Return a rental**

```http
POST /api/returns
Content-Type: application/json
x-auth-token: <your JWT>

{
  "customerId": "<customer id>",
  "movieId": "<movie id>"
}
```

### Status codes used

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid input, invalid token or business rule (e.g. return already processed) |
| 401 | No token provided |
| 403 | Logged in, but not allowed (not an admin) |
| 404 | Resource not found or invalid id |
| 500 | Unexpected server error (logged) |

---

## Running locally

### Requirements

- Node.js 24
- MongoDB running locally (default: `mongodb://localhost/vidly`)

### Steps

```bash
git clone https://github.com/bruunoc/vidly-api.git
cd vidly-api
npm install
```

Set the JWT private key (the app refuses to start without it):

```bash
# macOS / Linux
export vidly_jwtPrivateKey=yourSecretKey

# Windows (PowerShell)
$env:vidly_jwtPrivateKey = "yourSecretKey"
```

Start the API:

```bash
npm start
```

The API runs on `http://localhost:4000` (or on the port in the `PORT` environment variable).

### Environment variables

| Variable | Description | Default |
|---|---|---|
| `vidly_jwtPrivateKey` | Secret used to sign the JWTs | **required** |
| `vidly_db` | MongoDB connection string | `mongodb://localhost/vidly` |
| `PORT` | Port the server listens on | `4000` |
| `NODE_ENV` | Environment name (`test` uses `config/test.json`) | — |

---

## Tests

The project has **34 tests** (unit and integration) covering authentication, authorization, validation and the full returns flow.

- **Unit tests**: the `generateAuthToken` method and the `auth` middleware, using Jest mock functions
- **Integration tests**: real HTTP requests with Supertest against a separate test database (`vidly_tests`), cleaned after each test

Make sure MongoDB is running locally, then:

```bash
npm test
```

Tests run one file at a time (`--runInBand`) because the integration suites share the same port and test database. A coverage report is generated in the `coverage/` folder.

---

## Project structure

```
├── config/          # Settings per environment + environment variable mapping
├── database/        # Mongoose schemas and models
├── middleware/      # auth, admin, validate, validateObjectId, error handler
├── routes/          # One file per resource
├── start/           # App startup: logging, config check, db, routes, production middleware
├── tests/
│   ├── integration/ # Supertest + test database
│   └── unit/        # Isolated functions with mocks
└── index.js         # Entry point
```

---

## Deployment

- **API**: Render web service, auto-deployed on every push to `main`
- **Database**: MongoDB Atlas (free M0 cluster)
- **Secrets**: `vidly_db`, `vidly_jwtPrivateKey` and `NODE_ENV=production` set in Render's environment settings

---

## Author

**Bruno Candido** · [GitHub](https://github.com/bruunoc)
