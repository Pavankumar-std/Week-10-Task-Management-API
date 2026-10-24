# API Test Cases

Run the server locally and use Postman or curl. These are test instructions, not claims that the tests have already passed. Replace `BASE_URL`, `TOKEN`, and `TASK_ID` with your actual values.

Base URL: `http://localhost:5000`

| # | Test | Request | Expected result |
|---|---|---|---|
| 1 | Health check | `GET /api/health` | `200`; database reports connected when Atlas is configured |
| 2 | Register valid user | `POST /api/auth/register` with name, email, password | `201`; token and safe user data |
| 3 | Duplicate email | Register same email again | `409` |
| 4 | Short password | Register with password under 8 characters | `400` |
| 5 | Login valid user | `POST /api/auth/login` | `200`; JWT returned |
| 6 | Login wrong password | `POST /api/auth/login` with wrong password | `401` |
| 7 | Protected route without token | `GET /api/tasks` without Authorization | `401` |
| 8 | Create valid task | `POST /api/tasks` with Bearer token and title | `201`; task linked to current user |
| 9 | Invalid task title | Create task with title shorter than 3 characters | `400` |
| 10 | List tasks | `GET /api/tasks?page=1&limit=10` with token | `200`; data and pagination object |
| 11 | Filter tasks | `GET /api/tasks?completed=false&priority=high` with token | `200`; only matching owned tasks |
| 12 | Read one task | `GET /api/tasks/TASK_ID` with token | `200` for an owned task |
| 13 | Update task | `PATCH /api/tasks/TASK_ID` with `{"completed":true}` | `200`; updated task |
| 14 | Delete task | `DELETE /api/tasks/TASK_ID` with token | `200`; success message |
| 15 | Invalid ID | `GET /api/tasks/not-an-id` with token | `400` |
| 16 | Cross-user access | Use a different user's token on another user's task ID | `404`; task data is not disclosed |

## Example curl commands

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test.user@example.com","password":"ExamplePass123"}'
```

Create a task (replace `YOUR_TOKEN`):

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test MongoDB integration","priority":"high","category":"work"}'
```

List tasks (replace `YOUR_TOKEN`):

```bash
curl "http://localhost:5000/api/tasks?page=1&limit=10&completed=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Screenshot evidence checklist

After running real requests, save screenshots in `docs/screenshots/` showing:

1. Successful registration response (hide any token before sharing).
2. Successful login response (hide the token).
3. MongoDB Atlas collections containing User and Task documents; never expose credentials.
4. Task creation response.
5. Pagination and filtering response.
6. Task update and deletion responses.
7. Health endpoint showing the database connection state.

Do not create fake screenshots or mark unexecuted tests as passed.
