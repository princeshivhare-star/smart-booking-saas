# SmartBook — User Manual

## For Business Owners (Admin)

### Getting Started
1. Register at `/register` and select **Business Owner**
2. Fill in your name, email, password, and business name
3. You'll land on your **Admin Dashboard**

### Setting Up Your Business
1. Go to **Settings** in the sidebar
2. Fill in your business details (name, description, contact info, address)
3. Set your **Working Hours** — toggle each day on/off and set open/close times
4. Configure **Booking Settings**:
   - **Booking Interval**: How often slots appear (e.g., every 30 min)
   - **Max Advance Booking**: How many days ahead customers can book
   - **Cancellation Policy**: How many hours notice is required
   - **Auto-confirm**: Whether bookings are auto-approved or need manual confirmation
5. Click **Save All Changes**

### Adding Services
1. Go to **Services** in the sidebar
2. Click **Add Service**
3. Fill in:
   - **Name**: e.g., "Haircut & Beard Trim"
   - **Duration**: In minutes (e.g., 45)
   - **Price**: e.g., 35.00
   - **Buffer Time**: Cleanup time after the service
4. Click **Create Service**

### Managing Staff
1. Go to **Staff** in the sidebar
2. Click **Add Staff**
3. Enter their name, email, and a temporary password
4. The staff member can log in at `/login` and change their password
5. To remove a staff member, click the trash icon on their card

### Managing Bookings
1. Go to **Bookings** in the sidebar
2. Filter by status, date, or search by customer name/ref
3. Click the **eye icon** to view booking details
4. From the detail view you can:
   - **Confirm** a pending booking
   - **Mark Complete** after service is done
   - **Mark Paid** for cash payments
   - **Cancel** the booking

### Blocking Time Slots
1. Go to **Schedule** in the sidebar
2. Click **Block Slot**
3. Select staff member (or leave blank to block all staff)
4. Set the date, start/end time, type, and reason
5. Blocked slots will not appear to customers when booking

### Analytics Dashboard
Your dashboard shows:
- **Total Bookings** — all time
- **Upcoming** — confirmed/pending future bookings
- **Revenue** — total from paid bookings
- **Today's Bookings** — appointments today
- **Monthly Charts** — booking trends and revenue over time
- **Staff Performance** — bookings and revenue per staff member
- **Recent Bookings** — last 5 bookings at a glance

---

## For Staff Members

### Logging In
- Log in with your email and the password your admin gave you
- You'll land on your **Staff Dashboard**

### Dashboard
- **Today** — count of today's appointments
- **Upcoming** — future appointments count
- **Today's Appointments** — full list with customer name, service, time, phone

### Managing Your Schedule
1. Go to **My Schedule** in the sidebar
2. Click **Block Time** to mark yourself unavailable
3. Set the date, start/end time, and type (break, holiday, etc.)
4. Your blocked times will prevent customers from booking with you during those periods

---

## For Customers

### Creating an Account
1. Visit `/register` and select **Customer**
2. Fill in your name, email, and password
3. You'll land on your **Customer Dashboard**

### Booking a Service
1. Click **Book a Service** button or go to `/businesses`
2. Browse available businesses — filter by category or search
3. Click **Book Appointment** on a business
4. **Step 1 — Choose a service**: Click the service you want
5. **Step 2 — Pick staff & date**: Optionally select a specific staff member, then choose a date from the calendar
6. **Step 3 — Choose a time**: Select an available time slot (grey-out = taken)
7. **Step 4 — Confirm**:
   - Review your booking summary
   - Choose payment method (Pay at Location or Pay Online)
   - Add any notes for the business
   - Click **Confirm Booking**
8. You'll receive a confirmation email with your booking reference

### Managing Your Bookings
1. Go to **My Bookings** in the sidebar
2. Use tabs to filter: All / Upcoming / Completed / Cancelled
3. For upcoming bookings you can:
   - **Reschedule**: Pick a new date and time
   - **Cancel**: Cancel with an optional reason

### Updating Your Profile
1. Go to **Profile** in the sidebar
2. Update your name and phone number
3. Change your password under the password section

---

## Booking Reference Numbers
Every booking gets a unique short reference (e.g., `#A3F2B1`). Use this when contacting the business about your appointment.

## Email Notifications
You'll receive emails for:
- ✅ Registration welcome
- ✅ Booking confirmation
- ✅ Booking cancellation
- ✅ Booking rescheduled

> Note: Email requires configuration in the backend `.env` file. Without it, emails are logged to the server console in development mode.
