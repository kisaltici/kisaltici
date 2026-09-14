# Kısaltıcı

> A modern, full-stack URL shortener built with React, Node.js, Express, MongoDB, and Firebase Authentication.

Kısaltıcı is a modern URL shortening application designed with a clean, minimal SaaS experience. It allows users to create short, shareable links, manage their links, view click analytics, generate QR codes, and customize their account.

The application supports both guest users and authenticated users, with separate history and account-based link management.

## ✨ Features

* 🔗 Create short URLs with unique 6-character Base62 codes
* 👤 Google Authentication
* 🔐 Email & password authentication
* 📋 Copy shortened URLs to clipboard
* 📱 Generate QR codes for shortened URLs
* 📊 Click analytics and activity history
* 🕘 Authenticated URL history
* 🔎 Search through saved links
* ✏️ Rename saved links
* 🗑️ Delete saved links
* 🎨 Light and dark themes
* 🎨 Customizable color themes
* ⌨️ Custom keyboard shortcuts
* 👤 Editable user profile
* ⚡ Responsive design for desktop and mobile
* 🛡️ Rate limiting, Helmet, CORS protection and request validation
* ☁️ Vercel-ready serverless backend
* 🗄️ MongoDB Atlas persistence

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* Firebase Authentication

### Backend

* Node.js
* Express
* Mongoose
* MongoDB Atlas
* Firebase Admin SDK

### Deployment

* GitHub
* Vercel
* MongoDB Atlas
* Firebase

## 🏗️ Project Structure

```text
url-shortener/
├── api/
│   └── index.js
├── public/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
├── src/
│   ├── components/
│   ├── config/
│   ├── context/
│   ├── i18n/
│   ├── pages/
│   └── utils/
├── .env.example
├── server/.env.example
├── vercel.json
├── package.json
└── vite.config.js
```

## 🌐 Domains

The application uses separate production domains for the main application and shortened links.

| Purpose          | Domain                  |
| ---------------- | ----------------------- |
| Main application | `https://kisaltici.com` |
| Short URLs       | `https://lnk1.tr`       |

Example:

```text
https://lnk1.tr/aB3xYz
```

Local development automatically uses:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

## ⚙️ Environment Variables

### Frontend

Create a `.env` file in the project root:

```env
VITE_APP_URL=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

For production:

```env
VITE_APP_URL=https://kisaltici.com
VITE_API_BASE_URL=
```

### Backend

Create `server/.env`:

```env
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

MONGODB_URI=
FIREBASE_PROJECT_ID=
```

For production:

```env
BASE_URL=https://lnk1.tr
FRONTEND_URL=https://kisaltici.com
```

See `.env.example` and `server/.env.example` for the complete configuration reference.

> Never commit real `.env` files, credentials, private keys, or other secrets to the repository.

## 🚀 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/kisaltici/kisaltici.git
cd kisaltici
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables

Create the required `.env` files using the provided example files:

```text
.env.example
server/.env.example
```

Add your Firebase and MongoDB configuration.

### 5. Start the backend

```bash
cd server
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal:

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## 🔗 How URL Shortening Works

1. The user submits a valid HTTP/HTTPS URL.
2. The backend generates a unique 6-character Base62 code.
3. The shortened URL is stored in MongoDB.
4. The backend returns the generated short URL.
5. Visiting the short URL redirects the visitor to the original URL.
6. Click activity is recorded for analytics.

In production, short URLs use the dedicated `lnk1.tr` domain.

## 🔐 Authentication

Authentication is handled by Firebase Authentication.

Supported methods:

* Google
* Email & password

Firebase UID is used as the canonical user identity for authenticated application data.

User profile information and authenticated URL history are persisted through the backend and MongoDB.

## 📊 Analytics

Authenticated users can view statistics for their shortened links, including:

* Total clicks
* Creation date
* Last click
* 24-hour activity
* 7-day activity
* 30-day activity
* Click history

## 🔒 Security

The backend includes several security measures:

* Firebase token verification
* Request validation
* Rate limiting
* Helmet security headers
* CORS restrictions
* Safe redirect handling
* Environment-based secrets
* MongoDB connection protection
* Serverless-safe database connection caching

No sensitive credentials are stored in the source code.

## ☁️ Deployment

The project is designed to run on Vercel.

The architecture uses:

```text
GitHub
   │
   ▼
Vercel
   │
   ├── Frontend
   └── Serverless API
          │
          ▼
     MongoDB Atlas
```

Production domains:

```text
https://kisaltici.com
https://lnk1.tr
```

Required production environment variables should be configured through the Vercel project settings rather than committed to the repository.

## 📌 Current Status

The project is actively developed and prepared for production deployment.

Current implementation includes:

* URL shortening
* Authentication
* User profiles
* URL history
* Analytics
* QR generation
* Settings and personalization
* Security middleware
* Vercel serverless architecture
* Production domain configuration

Payment processing and subscription billing are not currently implemented.

## 📄 License

This project is currently maintained as a private portfolio/application project.