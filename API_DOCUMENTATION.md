# API Documentation

Base URL: `http://localhost:3000/api` (assuming default port 3000 based on ENV)

## Authentication

### UC16: Register (Guest)

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

### UC01: Login (Guest/Customer/Staff/Admin)

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

---

## Cars

### UC17: View List Car / UC19: Search Car

Search for cars based on various criteria or list all available cars.

- **URL**: `/cars/search`
- **Method**: `GET`
- **Query Parameters**:
  - `name`: (Optional) Search by car name (case-insensitive)
  - `brand`: (Optional) Search by brand (case-insensitive)
  - `model`: (Optional) Search by model (case-insensitive)
  - `category_id`: (Optional) Filter by category ID
  - `min_price`: (Optional) Minimum rental price per day
  - `max_price`: (Optional) Maximum rental price per day
  - `status`: (Optional) Filter by status (`Available`, `Rented`, `Reserved`, `Maintenance`, `Disabled`)

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
[
  {
    "car_id": 1,
    "category_id": 1,
    "name": "Toyota Camry",
    "brand": "Toyota",
    "model": "Camry",
    "year": 2022,
    "color": "Black",
    "license_plate": "ABC-123",
    "vin_number": "VIN123456",
    "status": "Available",
    "rental_price_per_day": 500.0,
    "current_mileage": 1000,
    "description": "Clean and well maintained",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "category": {
      "category_id": 1,
      "name": "Sedan",
      "description": "Standard sedan",
      "min_price": 300.0
    },
    "images": [
      {
        "image_id": 1,
        "car_id": 1,
        "image_url": "http://example.com/image.jpg",
        "is_thumbnail": true
      }
    ]
  }
]
```

---

### UC18: View Car Detail

Get detailed information about a specific car, including recent active bookings.

- **URL**: `/cars/:id`
- **Method**: `GET`

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
{
  "car_id": 1,
  "category_id": 1,
  "name": "Tesla Model 3",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "color": "White",
  "rental_price_per_day": "150.00",
  "category": { "name": "Electric", "min_price": "100.00" },
  "images": [ { "image_url": "...", "is_thumbnail": true } ],
  "bookings": [
    {
      "booking_id": 10,
      "status": "Active",
      "customer": {
        "full_name": "John Doe",
        "user": { "username": "johndoe", "email": "john@example.com", "phone": "0123456789" }
      }
    }
  ]
}
```

**Error Response**

- **Code**: `404 Not Found`
- **Content**:

```json
{
  "message": "Car not found"
}
```
---

## Bookings

### UC04: Book Car (Customer)

Submit a request to book a car for a specific rental period.

- **URL**: `/bookings`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required (JWT Token in Authorization Header)

**Request Body**

```json
{
  "car_id": 1,
  "start_date": "2024-03-01T09:00:00Z",
  "end_date": "2024-03-03T17:00:00Z"
}
```

**Success Response**

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "Booking created successfully",
  "booking": {
    "booking_id": 1,
    "customer_id": 1,
    "car_id": 1,
    "start_date": "2024-03-01T09:00:00.000Z",
    "end_date": "2024-03-03T17:00:00.000Z",
    "total_price": "300.00",
    "total_paid": "0.00",
    "status": "Pending",
    "payment_status": "Unpaid",
    "created_at": "2024-02-18T22:40:00.000Z",
    "updated_at": "2024-02-18T22:40:00.000Z",
    "car": { "car_id": 1, "name": "Toyota Camry", "...": "..." },
    "customer": { "user_id": 1, "full_name": "John Doe", "...": "..." }
  }
}
```

**Error Responses**

- **Code**: `400 Bad Request`
- **Content**:
  ```json
  { "message": "The car is already booked for the selected timeframe" }
  ```
- **Code**: `401 Unauthorized`
  ```json
  { "message": "Access denied. No token provided." }
  ```
- **Code**: `404 Not Found`
  ```json
  { "message": "Car not found" }
  ```
