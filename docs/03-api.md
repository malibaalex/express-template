# API

All routes are mounted under `/api`.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Welcome message |
| POST | `/api/auth/signup` | No | Register (`fullName`, `email`, `password`) |
| POST | `/api/auth/signin` | No | Log in (`email`, `password`) |
| GET | `/api/auth/profile` | Yes | Current user |
| PUT | `/api/auth/update/:id` | Yes | Update current user |
| POST | `/api/auth/logout` | No | Revoke refresh token, clear cookies |
| POST | `/api/auth/refresh` | No | Rotate access + refresh tokens |

## Response format

```json
{ "status": 200, "message": "success", "data": {} }
```

## Authentication

- **Access token**: 15 min by default. `httpOnly` cookie `access_token`, or `Authorization: Bearer <token>`.
- **Refresh token**: 7 days by default. `httpOnly` cookie `refresh_token`, stored in the DB. Rotated on refresh and on user update.
- **Cookies**: `sameSite=strict`, `secure` when `NODE_ENV=production` (requires HTTPS).
- **Passwords**: PBKDF2, SHA-512, 210,000 iterations, 64-byte key, random 16-byte salt per user.