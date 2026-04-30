# SmartBook API Documentation

Base URL: `http://localhost:5000/api`

All authenticated routes require:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /auth/register
Register a new user (customer or admin/business owner).

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer",            // "customer" | "admin"
  "businessName": "My Salon",    // required if role=admin
  "businessCategory": "salon"    // optional, if role=admin
}
```
**Response:** `201` `{ token, user }`

---

### POST /auth/login
**Body:** `{ email, password }`
**Response:** `200` `{ token, user }`

---

### GET /auth/me 🔒
Get current user profile.
**Response:** `{ user }`

---

### PUT /auth/profile 🔒
Update profile fields.
**Body:** `{ firstName, lastName, phone, avatar }`

---

### PUT /auth/change-password 🔒
**Body:** `{ currentPassword, newPassword }`

---

## Businesses

### GET /businesses
List all active businesses (public).
**Query:** `?category=salon&search=cuts&page=1&limit=20`

---

### GET /businesses/mine 🔒 [admin]
Get the authenticated admin's own business.

---

### GET /businesses/:id
Get a single business by ID or slug (public).

---

### PUT /businesses/:id 🔒 [admin]
Update business details.
**Body:** `{ name, description, category, contact, address, workingHours, settings }`

`workingHours` structure:
```json
{
  "monday":    { "open": "09:00", "close": "18:00", "isOpen": true },
  "tuesday":   { "open": "09:00", "close": "18:00", "isOpen": true },
  "saturday":  { "open": "09:00", "close": "13:00", "isOpen": false }
}
```

`settings` structure:
```json
{
  "bookingInterval": 30,
  "maxAdvanceBooking": 30,
  "cancellationPolicy": 24,
  "autoConfirm": true,
  "currency": "USD"
}
```

---

### GET /businesses/:businessId/staff
List staff for a business (public).

---

### POST /businesses/staff 🔒 [admin]
Add a staff member to the business.
**Body:** `{ firstName, lastName, email, password, phone, services[] }`

---

### DELETE /businesses/staff/:staffId 🔒 [admin]
Deactivate a staff member.

---

## Services

### GET /services?businessId=...
List active services for a business (public).

---

### GET /services/:id
Get a single service (public).

---

### POST /services 🔒 [admin]
Create a new service.
**Body:**
```json
{
  "name": "Haircut & Style",
  "description": "Full cut and styling",
  "duration": 45,
  "price": 35.00,
  "currency": "USD",
  "category": "Hair",
  "bufferTime": 10,
  "maxConcurrent": 1,
  "staffIds": ["<userId>"]
}
```

---

### PUT /services/:id 🔒 [admin]
Update a service. Same body as POST.

---

### DELETE /services/:id 🔒 [admin]
Soft-delete (deactivate) a service.

---

## Bookings

### GET /bookings/availability
Get available time slots (public).
**Query:** `?serviceId=<id>&date=2024-02-15&staffId=<id>`
**Response:**
```json
{
  "slots": ["09:00", "09:30", "10:00", "10:30"],
  "date": "2024-02-15",
  "serviceId": "<id>"
}
```

---

### POST /bookings 🔒
Create a new booking.
**Body:**
```json
{
  "serviceId": "<id>",
  "staffId": "<id>",
  "date": "2024-02-15",
  "startTime": "10:00",
  "paymentMethod": "at_location",
  "notes": "Please use organic products"
}
```
**Response:** `201` `{ booking }`

---

### GET /bookings 🔒
Get bookings (scoped by role).
- Admin: all bookings for their business
- Staff: their assigned bookings
- Customer: their own bookings

**Query:** `?status=confirmed&date=2024-02-15&page=1&limit=20`

---

### GET /bookings/:id 🔒
Get a single booking by ID.

---

### PUT /bookings/:id/reschedule 🔒
Reschedule an existing booking.
**Body:** `{ date: "2024-02-20", startTime: "11:00" }`

---

### PUT /bookings/:id/cancel 🔒
Cancel a booking.
**Body:** `{ reason: "Change of plans" }`

---

### PUT /bookings/:id/status 🔒 [admin, staff]
Update booking status.
**Body:** `{ status: "completed", internalNotes: "Customer was happy" }`
Status values: `pending | confirmed | completed | cancelled | no-show`

---

## Schedule

### GET /schedules/blocked
Get blocked time slots (public).
**Query:** `?businessId=<id>&staffId=<id>&date=2024-02-15`
or date range: `?businessId=<id>&startDate=2024-02-01&endDate=2024-02-28`

---

### POST /schedules/blocked 🔒 [admin, staff]
Block a time slot.
**Body:**
```json
{
  "staffId": "<id>",
  "date": "2024-02-15",
  "startTime": "12:00",
  "endTime": "13:00",
  "reason": "Lunch break",
  "type": "break"
}
```
Type values: `blocked | break | holiday | vacation`

---

### DELETE /schedules/blocked/:id 🔒 [admin, staff]
Unblock a time slot.

---

## Payments

### POST /payments/intent 🔒
Create a Stripe PaymentIntent for online payment.
**Body:** `{ bookingId: "<id>" }`
**Response:** `{ clientSecret, paymentIntentId }`

---

### POST /payments/webhook
Stripe webhook endpoint (raw body required).
Handles: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

### PUT /payments/:bookingId/mark-paid 🔒 [admin, staff]
Manually mark a booking's payment as paid (cash/POS).

---

### GET /payments/history 🔒
Get payment history for the authenticated customer.

---

## Analytics

### GET /analytics/admin 🔒 [admin]
Get full admin dashboard analytics.
**Response:**
```json
{
  "stats": {
    "totalBookings": 124,
    "upcomingBookings": 18,
    "cancelledBookings": 5,
    "completedBookings": 95,
    "todayBookings": 8,
    "totalRevenue": 3240.50,
    "paidBookings": 72,
    "staffCount": 4
  },
  "monthlyData": [
    { "_id": "2024-01", "bookings": 42, "revenue": 1050.00 }
  ],
  "staffPerformance": [...],
  "recentBookings": [...]
}
```

---

### GET /analytics/staff 🔒 [staff, admin]
Get staff dashboard data.
**Response:**
```json
{
  "todayAppointments": [...],
  "upcomingAppointments": [...],
  "totalCompleted": 38
}
```

---

## Users

### GET /users 🔒 [admin]
List all users for the business.
**Query:** `?role=staff&search=john&page=1&limit=20`

---

### GET /users/:id 🔒
Get a user by ID.

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Description of the error",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

| Code | Meaning                     |
|------|-----------------------------|
| 400  | Bad Request / Validation    |
| 401  | Unauthorized (no/bad token) |
| 403  | Forbidden (wrong role)      |
| 404  | Not Found                   |
| 409  | Conflict (slot taken)       |
| 422  | Validation Error            |
| 500  | Internal Server Error       |
