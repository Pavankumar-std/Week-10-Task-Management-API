# Week 10 — Task Management API with MongoDB

A RESTful task management backend built with Node.js, Express, MongoDB Atlas, Mongoose, JWT, and bcrypt. Users can register and log in, then create, read, update, filter, sort, paginate, and delete their own tasks.

> **Status:** Source code scaffold is provided. Configure your own Atlas database and run the tests below before describing the project as deployed or fully tested.

## Features

- User registration and login with bcrypt password hashing
- JWT-protected profile and task endpoints
- Mongoose User and Task models with validation
- Each task references its owner with `Task.user -> User._id`
- CRUD endpoints with ownership checks
- Pagination (`page`, `limit`), filtering (`completed`, `priority`, `category`), title search, and sorting
- Central error handling, Helmet security headers, CORS, JSON body-size limit, and request rate limiting
- MongoDB indexes for common task queries

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB Atlas cluster (or a local MongoDB server)
- Postman, Insomnia, or curl for API testing

## Installation

1. Open this project folder in VS Code.
2. Install dependencies:

   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`.
4. Replace `MONGODB_URI` with your Atlas connection string. Replace `<username>`, `<password>`, and `<cluster-url>` with your actual database credentials and cluster host. URL-encode special characters in the database password.
5. Set `JWT_SECRET` to a long, random secret of at least 32 characters.
6. In MongoDB Atlas, create a database user and allow your current IP in Network Access. Prefer your current IP rather than `0.0.0.0/0`.
7. Start the development server:

   ```bash
   npm run dev
   ```

   Or run `npm start`.

8. Visit `http://localhost:5000/` and `http://localhost:5000/api/health`.

Never commit `.env`, database credentials, or real JWT secrets. `.env.example` contains placeholders only.

## API endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | No | API welcome |
| GET | `/api/health` | No | API/database status |
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Log in and receive JWT |
| GET | `/api/auth/me` | Bearer token | Get current user profile |
| POST | `/api/tasks` | Bearer token | Create a task |
| GET | `/api/tasks` | Bearer token | List tasks with filtering |
| GET | `/api/tasks/:id` | Bearer token | Get one owned task |
| PATCH | `/api/tasks/:id` | Bearer token | Update an owned task |
| DELETE | `/api/tasks/:id` | Bearer token | Delete an owned task |

### Register

`POST /api/auth/register`

```json
{
  "name": "Pavan Kumar",
  "email": "pavan@example.com",
  "password": "ChangeThisPassword123"
}
```

The API returns a JWT and safe user details. Use your own test email and password.

### Login

`POST /api/auth/login`

```json
{
  "email": "pavan@example.com",
  "password": "ChangeThisPassword123"
}
```

For protected endpoints, send this header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

### Create a task

`POST /api/tasks`

```json
{
  "title": "Complete Week 10 project",
  "description": "Test the MongoDB task API",
  "priority": "high",
  "category": "work",
  "completed": false,
  "dueDate": "2027-01-15T12:00:00.000Z"
}
```

The task owner is taken from the verified JWT, not from the request body.

### List, filter, search, paginate, and sort

Examples:

```text
GET /api/tasks?page=1&limit=10
GET /api/tasks?completed=false
GET /api/tasks?priority=high&category=work
GET /api/tasks?search=project
GET /api/tasks?sort=oldest
GET /api/tasks?sort=dueDate
GET /api/tasks?sort=priority
```

Supported sort values: `newest` (default), `oldest`, `dueDate`, `priority`. The maximum page size is 100.

### Update a task

`PATCH /api/tasks/TASK_ID`

```json
{
  "completed": true,
  "priority": "medium"
}
```

### Delete a task

`DELETE /api/tasks/TASK_ID`

A user cannot read, update, or delete a task belonging to another user.

## Database design

- **User**: `name`, `email`, hashed `password`, timestamps.
- **Task**: `title`, `description`, `completed`, `priority`, `dueDate`, `category`, `user`, timestamps.
- **Relationship**: one user can own many tasks. Each task stores a MongoDB ObjectId reference to one User document.
- **Indexes**: task owner/status/creation date, owner/priority, and due date.
- Mongoose schema validation enforces required fields, lengths, and allowed enum values.

A simple relationship diagram is in [`docs/database-schema.md`](docs/database-schema.md).

## Testing

Follow [`tests/api-test-cases.md`](tests/api-test-cases.md). Register a test user, copy the token, then test each protected endpoint in Postman. Save genuine screenshots in `docs/screenshots/` after running the API locally.

## Project structure

```text
server.js
src/
  config/database.js
  models/User.js
  models/Task.js
  controllers/userController.js
  controllers/taskController.js
  middleware/auth.js
  routes/userRoutes.js
  routes/taskRoutes.js
docs/
  screenshots/
  database-schema.md
tests/
  api-test-cases.md
```

## Troubleshooting

- **MongoDB connection error:** confirm the URI, database username/password, cluster hostname, and Atlas IP allowlist.
- **Authentication error:** send `Authorization: Bearer <token>` and make sure the token has not expired.
- **Validation error:** read the returned `message` and `errors` array.
- **Port in use:** change `PORT` in `.env`.

## Deployment

Deploy to a Node.js hosting provider that supports environment variables. Configure `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `PORT` in the provider's environment settings. Do not upload `.env`. After deployment, test `/api/health` and all authenticated routes against the deployed URL.

## License

MIT
