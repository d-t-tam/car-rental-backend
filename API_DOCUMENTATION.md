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

### System Rule: Auto-Cancel No-Show Booking

The backend runs a cron job to auto-cancel bookings when customers do not pick up the car on time.

- Applies to booking status: `Confirmed`, `Deposit Paid`
- Auto-update status to: `Cancelled`
- Condition: `start_date` has passed by configured grace period
- No API call is required; this runs automatically in backend

Environment variables:

- `BOOKING_NO_SHOW_CRON` (default: `*/30 * * * *`)
- `BOOKING_NO_SHOW_GRACE_HOURS` (default: `2`)
- `BOOKING_NO_SHOW_TIMEZONE` (default: `Asia/Bangkok`)

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

### UC15: Handover Queue (Staff/Admin)

Get bookings ready for car handover (already approved by staff/admin).

- **URL**: `/bookings/handover-ready`
- **Method**: `GET`
- **Authentication**: Required (Staff/Admin role)

**Rules**

- Booking statuses in queue: `Confirmed`, `Deposit Paid`

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
[
  {
    "booking_id": 21,
    "status": "Confirmed",
    "start_date": "2026-03-20T00:00:00.000Z",
    "end_date": "2026-03-22T00:00:00.000Z",
    "car": {
      "name": "Toyota Vios",
      "current_mileage": 12500,
      "category": { "name": "Sedan" }
    },
    "customer": {
      "full_name": "Nguyen Van A",
      "user": { "email": "customer@example.com" }
    }
  }
]
```

---

### UC15: Return Queue (Staff/Admin)

Get bookings ready for return intake (cars already handed over to customers).

- **URL**: `/bookings/return-ready`
- **Method**: `GET`
- **Authentication**: Required (Staff/Admin role)

**Rules**

- Booking status in queue: `Active`

**Success Response**

- **Code**: `200 OK`
- **Content**:

```json
[
  {
    "booking_id": 22,
    "status": "Active",
    "start_date": "2026-03-18T00:00:00.000Z",
    "end_date": "2026-03-19T00:00:00.000Z",
    "car": {
      "name": "Honda City",
      "current_mileage": 22000,
      "category": { "name": "Sedan" }
    },
    "customer": {
      "full_name": "Tran Thi B",
      "user": { "email": "customer2@example.com" }
    }
  }
]
```

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

---

### UC15: Car Handover (Staff/Admin)

Record the vehicle handover checklist when staff delivers a car to customer.

- **URL**: `/bookings/:id/handover`
- **Method**: `POST`
- **Authentication**: Required (Staff/Admin role)
- **Content-Type**: `application/json`

**Request Body**

```json
{
  "odometer_reading": 12500,
  "fuel_level": 80,
  "condition_summary": "Exterior and interior in good condition",
  "customer_signature_url": "https://example.com/signatures/handover-1.png",
  "items": [
    { "item_name": "Front bumper", "status": "OK", "notes": "No scratch" },
    { "item_name": "Spare tire", "status": "OK" },
    { "item_name": "Floor mat", "status": "Missing", "notes": "Missing rear-right mat" }
  ]
}
```

**Business Rules**

- Booking status must be `Confirmed` or `Deposit Paid`.
- System creates a `Handover` inspection record.
- Booking status is updated to `Active`.
- Car status is updated to `Rented`.
- One handover inspection per booking.

**Success Response**

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "Car handover recorded successfully",
  "inspection": {
    "inspection_id": 10,
    "booking_id": 1,
    "type": "Handover",
    "odometer_reading": 12500,
    "fuel_level": 80
  }
}
```

---

### UC15: Car Return Intake (Staff/Admin)

Record the return checklist when customer returns the car and staff receives it.

- **URL**: `/bookings/:id/return`
- **Method**: `POST`
- **Authentication**: Required (Staff/Admin role)
- **Content-Type**: `application/json`

**Request Body**

```json
{
  "odometer_reading": 12840,
  "fuel_level": 45,
  "condition_summary": "Rear bumper scratched",
  "customer_signature_url": "https://example.com/signatures/return-1.png",
  "items": [
    { "item_name": "Rear bumper", "status": "Damaged", "notes": "Scratch on right side" },
    { "item_name": "Spare tire", "status": "OK" }
  ]
}
```

**Business Rules**

- Booking status must be `Active`.
- System creates a `Return` inspection record.
- Booking status is updated to `Completed`.
- Car status is updated to `Available`.
- One return inspection per booking.

**Success Response**

- **Code**: `201 Created`
- **Content**:

```json
{
  "message": "Car return recorded successfully",
  "inspection": {
    "inspection_id": 11,
    "booking_id": 1,
    "type": "Return",
    "odometer_reading": 12840,
    "fuel_level": 45
  }
}
```
