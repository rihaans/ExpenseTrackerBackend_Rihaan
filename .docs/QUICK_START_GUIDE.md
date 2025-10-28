# Quick Start Guide - Expense Tracker Backend API

This guide will help you get the API up and running quickly.

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Firebase project created
- [ ] Firebase service account key downloaded

## Setup Steps

### 1. Install Dependencies

```bash
cd ExpenseTrackerBackend_Riha
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expense-tracker
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
CORS_ORIGIN=*
```

### 3. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon → Project Settings
4. Go to Service Accounts tab
5. Click "Generate New Private Key"
6. Open the downloaded JSON file
7. **Important:** Convert to a single line (remove line breaks)
8. Paste as `FIREBASE_SERVICE_ACCOUNT_KEY` value in `.env`

### 4. Enable Firebase Authentication

1. In Firebase Console, go to Authentication
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click Save

### 5. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas:**
- Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Get connection string and update `MONGODB_URI` in `.env`

### 6. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
==================================================
Server running in development mode
Server listening on port 5000
API URL: http://localhost:5000
==================================================
MongoDB Connected: localhost
Firebase Admin SDK initialized successfully
```

## Testing with Postman

### Import the Collection

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json` from the project folder
4. The collection will be imported with all endpoints

### Set Environment Variables in Postman

1. Click "Environments" in Postman
2. Create a new environment (e.g., "Local Development")
3. Add these variables:
   - `baseUrl`: `http://localhost:5000`
   - `authToken`: (leave empty, will be set automatically)
   - `expenseId`: (leave empty, will be set automatically)

### Testing Workflow

#### 1. Health Check
- Run: `GET /` or `GET /health`
- Should return 200 OK

#### 2. Register a User
- Run: `POST /api/register`
- Body example:
  ```json
  {
    "email": "test@example.com",
    "password": "TestPass123",
    "displayName": "Test User"
  }
  ```
- Save the returned `customToken`

#### 3. Get Firebase ID Token

**Option A: Use Firebase Client SDK (Recommended for production)**

Install Firebase in a test project:
```bash
npm install firebase
```

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const app = initializeApp({
  apiKey: "your-api-key",
  // ... other config
});

const auth = getAuth(app);
signInWithCustomToken(auth, customToken)
  .then((userCredential) => {
    return userCredential.user.getIdToken();
  })
  .then((idToken) => {
    console.log('ID Token:', idToken);
  });
```

**Option B: For Testing Only - Use the Custom Token**

For quick testing, you can create a simple endpoint or use Firebase Admin SDK to verify custom tokens.

#### 4. Create an Expense
- Run: `POST /api/expenses`
- Headers: `Authorization: Bearer <your-id-token>`
- Body:
  ```json
  {
    "title": "Test Expense",
    "amount": 100.50,
    "category": "Food",
    "notes": "Test expense"
  }
  ```
- The `expenseId` will be automatically saved to environment

#### 5. Get All Expenses
- Run: `GET /api/expenses`
- Headers: `Authorization: Bearer <your-id-token>`

#### 6. Test Reports
- Run: `GET /api/reports/monthly?month=1&year=2025`
- Headers: `Authorization: Bearer <your-id-token>`

## Common Issues & Solutions

### Issue: "MongoDB connection error"

**Solution:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- For Atlas, whitelist your IP address

### Issue: "Firebase Admin SDK initialization failed"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is on a single line
- Check for missing quotes or brackets
- Ensure the JSON is valid

### Issue: "Port already in use"

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

Or change `PORT` in `.env` file.

### Issue: "Unauthorized: No token provided"

**Solution:**
- Ensure you're sending the `Authorization` header
- Format: `Authorization: Bearer <token>`
- Check that the token hasn't expired

## API Testing Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","displayName":"Test User"}'
```

**Create Expense:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Lunch","amount":25.50,"category":"Food"}'
```

**Get Monthly Report:**
```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=1&year=2025" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure Quick Reference

```
src/
├── server.js              # Main entry point
├── controllers/           # Business logic
│   ├── authController.js
│   ├── expenseController.js
│   └── reportController.js
├── models/               # Database schemas
│   ├── User.js
│   └── Expense.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── expenseRoutes.js
│   └── reportRoutes.js
├── middleware/           # Custom middleware
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── validators.js
└── firebase/             # Firebase config
    └── firebaseConfig.js
```

## Available Categories

- Food
- Transportation
- Entertainment
- Healthcare
- Shopping
- Bills
- Education
- Travel
- Personal
- Other

## Available Payment Methods

- Cash
- Credit Card
- Debit Card
- UPI
- Net Banking
- Other

## Next Steps

1. Read the full [README.md](README.md) for detailed documentation
2. Check [API_Documentation.md](API_Documentation.md) for complete API reference
3. Import [postman_collection.json](postman_collection.json) for testing
4. Explore the codebase and customize as needed

## Support

- Check the README.md for troubleshooting
- Review API_Documentation.md for endpoint details
- Create an issue in the repository for bugs

---

**Happy Coding!**
