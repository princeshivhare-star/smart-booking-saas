# SmartBook — Smart Booking SaaS Platform

A full-stack SaaS booking platform for service-based businesses (barbershops, clinics, salons, workshops, consultants, etc.). Built with React.js, Node.js + Express, and MongoDB.

---

## 📁 Project Structure

```
smart-booking/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── business.controller.js
│   │   │   ├── service.controller.js
│   │   │   ├── schedule.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── analytics.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT authentication & RBAC
│   │   │   └── validate.middleware.js
│   │   ├── models/
│   │   │   ├── User.model.js
│   │   │   ├── Business.model.js
│   │   │   ├── Service.model.js
│   │   │   ├── Booking.model.js
│   │   │   └── BlockedSlot.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── business.routes.js
│   │   │   ├── service.routes.js
│   │   │   ├── schedule.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── user.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── services/
│   │   │   ├── availability.service.js  # Real-time slot logic
│   │   │   └── email.service.js         # Email (mock + nodemailer)
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── StatCard.jsx
    │   │   │   └── index.jsx        # Modal, Badges, EmptyState
    │   │   └── layout/
    │   │       ├── AdminLayout.jsx
    │   │       ├── StaffLayout.jsx
    │   │       └── CustomerLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # Global auth state
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── BusinessListPage.jsx
    │   │   ├── BookingPage.jsx      # 4-step booking wizard
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminBookings.jsx
    │   │   │   ├── AdminServices.jsx
    │   │   │   ├── AdminStaff.jsx
    │   │   │   ├── AdminSchedule.jsx
    │   │   │   └── AdminSettings.jsx
    │   │   ├── staff/
    │   │   │   ├── StaffDashboard.jsx
    │   │   │   └── StaffSchedule.jsx
    │   │   └── customer/
    │   │       ├── CustomerDashboard.jsx
    │   │       ├── CustomerBookings.jsx
    │   │       └── CustomerProfile.jsx
    │   ├── services/
    │   │   └── api.js               # Axios instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### Step 1 — Clone & Setup

```bash
# If using git
git clone <repo-url>
cd smart-booking

# Or navigate to the project folder
cd smart-booking
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart_booking
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000

# Optional: Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@smartbooking.com
```

Start the backend:
```bash
npm run dev
```

The API will run at: `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

### Step 3 — Frontend Setup

```bash
cd ../frontend
npm install
```

Create your `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Start the frontend:
```bash
npm run dev
```

The app will run at: `http://localhost:3000`

---

### Step 4 — Create Your First Admin Account

1. Open `http://localhost:3000/register`
2. Select **Business Owner** role
3. Fill in your details and business name
4. You'll be redirected to the Admin Dashboard

---

## 🗄️ Database

### MongoDB Atlas (Cloud — Recommended for Production)

1. Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart_booking
```

### Local MongoDB

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

---

## 👤 User Roles

| Role     | Access                                              |
|----------|-----------------------------------------------------|
| Admin    | Full business management, analytics, staff, settings |
| Staff    | Today's appointments, own schedule management        |
| Customer | Browse businesses, book, reschedule, cancel          |

---

## 🌐 Deployment

### Backend → Render.com

1. Push backend to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repo, set root directory to `backend/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

### Frontend → Vercel

1. Push frontend to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend/`
4. Framework: Vite
5. Add environment variables:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your key

---

## 💳 Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get keys from Dashboard → Developers → API Keys
3. Add to backend `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
4. Add to frontend `.env`:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

For webhooks (local testing):
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## 📧 Email Setup (Gmail)

1. Enable 2FA on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a password for "Mail"
4. Use in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=generated_app_password
```

> Without email config, emails are mocked and logged to the console.

---

## 🔧 Useful Commands

```bash
# Backend
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start

# Frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🗺️ Phase 2 Roadmap

The codebase is structured to support:
- [ ] Google Calendar Integration
- [ ] SMS Notifications (Twilio)
- [ ] Loyalty Points System
- [ ] Subscription Plans (Free / Basic / Pro)
- [ ] Mobile App (React Native — same API)
- [ ] AI Scheduling Suggestions
- [ ] Multi-location per business
- [ ] Public booking page (SEO-friendly)
