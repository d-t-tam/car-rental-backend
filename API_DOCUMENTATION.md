# API Documentation

Base URL: `http://localhost:3000/api` (assuming default port 3000 based on ENV)

## Authentication

### Register

Create a new customer account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "user123",
  "full_name": "John Doe",
  "phone": "1234567890",
  "license_number": "A1234567",
  "address": "123 Main St"
}
```

**Success Response**

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "username": "user123",
    "role": "Customer",
    "status": "Active",
    "created_at": "2024-01-01T00:00:00.000Z"
    // ...other user fields
  },
  "profile": {
    "profile_id": 1,
    "user_id": 1,
    "full_name": "John Doe",
    "license_number": "A1234567",
    "address": "123 Main St",
    "wallet_balance": 0
    // ...other profile fields
  }
}
```

**Error Response**

- **Code**: `400 Bad Request`
- **Content**:

```json
{
  "message": "Email or username already exists"
}
```

---

### Login

Authenticate a user and retrieve a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "email": "user@example.com",
    "username": "user123",
    "role": "Customer",
    "status": "Active"
    // ...other user fields
  }
}
```

**Error Response**

- **Code**: `401 Unauthorized`
- **Content**:

```json
{
  "message": "Invalid credentials"
}
```
OR
```json
{
  "message": "User account is not active"
}
```
