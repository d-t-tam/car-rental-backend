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
  },
  "profile": {
    "profile_id": 1,
    "user_id": 1,
    "full_name": "John Doe",
    "license_number": "A1234567",
    "address": "123 Main St",
    "wallet_balance": 0
  }
}
```

---

### UC01: Login (Guest/Customer/Staff/Admin)

Authenticate a user (Guest, Customer, Staff, or Admin) and retrieve a JWT token.

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
  }
}
```

**Staff Success Response Example**

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 2,
    "email": "staff@example.com",
    "username": "staff_member",
    "role": "Staff",
    "status": "Active"
  }
}
```

---

### UC03: Manage Profile (Customer)

Get and update the authenticated customer's profile.

#### Get Profile

- **URL**: `/profile`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization Header)

#### Update Profile

- **URL**: `/profile`
- **Method**: `PUT`
- **Content-Type**: `application/json`
- **Authentication**: Required (JWT Token in Authorization Header)

---

## Cars

### UC17: View List Car / UC19: Search Car

Search for cars based on various criteria or list all available cars.

- **URL**: `/cars/search`
- **Method**: `GET`
- **Query Parameters**:
  - `name`, `brand`, `model`, `category_id`, `min_price`, `max_price`, `status`

---

### UC18: View Car Detail

Get detailed information about a specific car, including recent active bookings.

- **URL**: `/cars/:id`
- **Method**: `GET`

---

## Bookings

### UC04: Book Car (Customer)

Submit a request to book a car for a specific rental period.

- **URL**: `/bookings`
- **Method**: `POST`
- **Authentication**: Required

---

### UC06: View Booking History (Customer)

Retrieve the list of all bookings made by the authenticated customer.

- **URL**: `/bookings/my-bookings`
- **Method**: `GET`
- **Authentication**: Required (JWT Token in Authorization Header)

**Success Response**

```json
[
  {
    "booking_id": 1,
    "customer_id": 1,
    "car_id": 1,
    "start_date": "2024-03-01T09:00:00.000Z",
    "end_date": "2024-03-03T17:00:00.000Z",
    "total_price": "300.00",
    "status": "Pending",
    "car": {
      "car_id": 1,
      "name": "Toyota Camry",
      "category": { "name": "Sedan" },
      "images": [{ "image_url": "...", "is_thumbnail": true }]
    }
  }
]
```

---
 
 ### UC05: Cancel Booking (Customer)
 
 Cancel a booking before car pickup.
 
 - **URL**: `/bookings/:id/cancel`
 - **Method**: `PATCH`
 - **Authentication**: Required (JWT Token in Authorization Header)
 
 **Success Response**
 
 - **Code**: `200 OK`
 - **Content**:
 
 ```json
 {
   "message": "Booking cancelled successfully",
   "booking": {
     "booking_id": 1,
     "status": "Cancelled"
   }
 }
 ```
 
 ---
 
 ### Get Booked Dates

Retrieve all occupied date ranges for a specific car (used to disable dates in the UI).

- **URL**: `/bookings/car/:car_id/booked-dates`
- **Method**: `GET`

---

### UC14: Approve Booking (Staff/Admin)

Review and approve a pending booking request.

- **URL**: `/bookings/pending`
- **Method**: `GET`
- **Authentication**: Required (Staff/Admin role)

**Pending List Success Response**

- **Code**: `200 OK`
- **Content**:

```json
[
  {
    "booking_id": 12,
    "customer_id": 3,
    "car_id": 7,
    "start_date": "2026-03-10T00:00:00.000Z",
    "end_date": "2026-03-12T00:00:00.000Z",
    "total_price": "450.00",
    "status": "Pending",
    "car": {
      "name": "Toyota Vios",
      "category": { "name": "Sedan" },
      "images": [{ "image_url": "...", "is_thumbnail": true }]
    },
    "customer": {
      "full_name": "Nguyen Van A",
      "user": { "email": "customer@example.com", "username": "customer01" }
    }
  }
]
```

---

- **URL**: `/bookings/review-history`
- **Method**: `GET`
- **Authentication**: Required (Staff/Admin role)

Retrieve booking requests already processed by staff (Approved/Rejected).

**Review History Success Response**

- **Code**: `200 OK`
- **Content**:

```json
[
  {
    "booking_id": 11,
    "status": "Confirmed",
    "updated_at": "2026-03-02T10:20:00.000Z",
    "car": {
      "name": "Honda City",
      "category": { "name": "Sedan" }
    },
    "customer": {
      "full_name": "Tran Thi B",
      "user": { "email": "customer2@example.com" }
    }
  },
  {
    "booking_id": 10,
    "status": "Cancelled",
    "updated_at": "2026-03-02T09:45:00.000Z"
  }
]
```

---

- **URL**: `/bookings/:id/approve`
- **Method**: `PATCH`
- **Authentication**: Required (Staff/Admin role)

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Booking approved successfully",
  "booking": {
    "booking_id": 1,
    "status": "Confirmed"
  }
}
```

---

### UC14: Reject Booking (Staff/Admin)

Review and reject a pending booking request.

- **URL**: `/bookings/:id/reject`
- **Method**: `PATCH`
- **Authentication**: Required (Staff/Admin role)
- **Request Body**:

```json
{
  "reason": "Car is under maintenance"
}
```

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
{
  "message": "Booking rejected successfully",
  "booking": {
    "booking_id": 1,
    "status": "Cancelled"
  }
}
```
