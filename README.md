# Expense Tracker Backend API

A comprehensive RESTful API for managing personal expenses with Firebase Authentication and MongoDB storage. This backend provides complete expense tracking capabilities including user authentication, CRUD operations, and detailed financial reports.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing with Postman](#testing-with-postman)
- [Security Features](#security-features)
- [Error Handling](#error-handling)
- [Contributing](#contributing)

## Features

### User Authentication (Firebase)
- User registration with email/password
- Secure login with Firebase token verification
- Token-based authentication for protected routes
- Logout with refresh token revocation
- User profile management

### Expense Management
- Create, read, update, and delete expenses
- Categorized expense tracking (Food, Transportation, Healthcare, etc.)
- Date-based expense recording
- Optional notes and payment method tracking
- Advanced filtering and sorting capabilities
- Pagination support for large datasets

### Reports & Analytics
- Monthly expense summaries with category breakdown
- Category-specific expense reports
- Overall statistics with aggregation
- Trend analysis by month
- Payment method breakdown
- Percentage distribution across categories

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Firebase Admin SDK
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Environment**: dotenv

## Project Structure

```
ExpenseTrackerBackend_Riha/
├── src/
│   ├── server.js                 # Main application entry point
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── expenseController.js  # Expense CRUD operations
│   │   └── reportController.js   # Reports and analytics
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Expense.js            # Expense schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── expenseRoutes.js      # Expense endpoints
│   │   └── reportRoutes.js       # Report endpoints
│   ├── middleware/
│   │   ├── authMiddleware.js     # Firebase token verification
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validators.js         # Input validation rules
│   └── firebase/
│       └── firebaseConfig.js     # Firebase Admin initialization
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── API_Documentation.pdf
└── postman_collection.json
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Firebase Project** with Admin SDK credentials

## Installation

1. **Clone the repository** (or extract the project folder):
   ```bash
   cd ExpenseTrackerBackend_Riha
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Email/Password authentication:
     - Navigate to Authentication > Sign-in method
     - Enable Email/Password provider
   - Generate a service account key:
     - Go to Project Settings > Service Accounts
     - Click "Generate New Private Key"
     - Save the JSON file securely

4. **Set up MongoDB**:
   - **Local MongoDB**: Install MongoDB locally or
   - **MongoDB Atlas**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Get your connection string

## Configuration

1. **Create a `.env` file** in the root directory:
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables**:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# For MongoDB Atlas use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker

# Firebase Admin SDK Configuration
# Paste your entire Firebase service account JSON as a single line
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}

# CORS Configuration
CORS_ORIGIN=*
```

### How to Get Firebase Service Account Key

1. Open Firebase Console
2. Go to Project Settings (gear icon) > Service Accounts
3. Click "Generate New Private Key"
4. Open the downloaded JSON file
5. **Important**: Convert the entire JSON to a single line (remove all line breaks)
6. Paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env` file

Example:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"expense-tracker-12345","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xyz@expense-tracker-12345.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40expense-tracker-12345.iam.gserviceaccount.com"}
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the configured port (default: 5000).

You should see:
```
==================================================
Server running in development mode
Server listening on port 5000
API URL: http://localhost:5000
==================================================
MongoDB Connected: localhost
Database Name: expense-tracker
Firebase Admin SDK initialized successfully
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Health Check
```http
GET /
GET /health
```

### Authentication Endpoints

#### 1. Register New User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe" // optional
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uid": "firebase-uid-here",
    "email": "user@example.com",
    "displayName": "John Doe",
    "customToken": "firebase-custom-token"
  }
}
```

#### 2. Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "idToken": "firebase-id-token"
}
```

**Note**: To get the `idToken`, you need to authenticate with Firebase on the client side. For testing purposes, you can use the `customToken` from registration.

#### 3. Logout User
```http
POST /api/logout
Authorization: Bearer <firebase-id-token>
```

#### 4. Get User Profile
```http
GET /api/profile
Authorization: Bearer <firebase-id-token>
```

### Expense Endpoints (All require authentication)

#### 1. Get All Expenses
```http
GET /api/expenses
Authorization: Bearer <firebase-id-token>
```

**Query Parameters**:
- `category` (optional): Filter by category
- `startDate` (optional): Filter by start date (ISO 8601)
- `endDate` (optional): Filter by end date (ISO 8601)
- `sortBy` (optional): Sort field (default: 'date')
- `order` (optional): Sort order ('asc' or 'desc', default: 'desc')
- `limit` (optional): Results per page
- `page` (optional): Page number (default: 1)

**Example**:
```http
GET /api/expenses?category=Food&sortBy=amount&order=desc&limit=10&page=1
```

#### 2. Get Single Expense
```http
GET /api/expenses/:id
Authorization: Bearer <firebase-id-token>
```

#### 3. Create Expense
```http
POST /api/expenses
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Grocery Shopping",
  "amount": 150.50,
  "category": "Food",
  "date": "2025-01-15T10:30:00Z", // optional, defaults to current time
  "notes": "Weekly groceries", // optional
  "paymentMethod": "Credit Card" // optional
}
```

**Valid Categories**:
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

**Valid Payment Methods**:
- Cash
- Credit Card
- Debit Card
- UPI
- Net Banking
- Other

#### 4. Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "title": "Updated title",
  "amount": 200.00,
  "category": "Shopping"
}
```

#### 5. Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <firebase-id-token>
```

### Report Endpoints (All require authentication)

#### 1. Monthly Report
```http
GET /api/reports/monthly?month=1&year=2025
Authorization: Bearer <firebase-id-token>
```

**Response**:
```json
{
  "success": true,
  "message": "Monthly report generated successfully",
  "data": {
    "summary": {
      "month": 1,
      "year": 2025,
      "totalExpenses": 1250.75,
      "totalTransactions": 15,
      "dailyAverage": 40.35,
      "daysInMonth": 31,
      "categoryBreakdown": [
        {
          "category": "Food",
          "amount": 450.00,
          "count": 8,
          "percentage": 36.00
        },
        {
          "category": "Transportation",
          "amount": 300.00,
          "count": 4,
          "percentage": 24.00
        }
      ]
    },
    "expenses": [...]
  }
}
```

#### 2. Category Report
```http
GET /api/reports/category?category=Food
Authorization: Bearer <firebase-id-token>
```

**Optional Query Parameters**:
- `startDate`: Filter from date
- `endDate`: Filter to date

#### 3. Overall Statistics
```http
GET /api/reports/stats
Authorization: Bearer <firebase-id-token>
```

**Optional Query Parameters**:
- `startDate`: Filter from date
- `endDate`: Filter to date

## Testing with Postman

1. **Import the collection**:
   - Open Postman
   - Click Import
   - Select `postman_collection.json` from the project root

2. **Set up environment variables**:
   - Create a new environment in Postman
   - Add variables:
     - `baseUrl`: `http://localhost:5000`
     - `authToken`: (will be set after login)

3. **Test workflow**:
   - Run Register endpoint to create a user
   - Use the returned `customToken` to authenticate (or use Firebase client SDK)
   - Set the `authToken` variable with your Firebase ID token
   - All other requests will use this token automatically

## Security Features

- **Firebase Authentication**: Server-side token verification
- **Helmet**: Security headers for Express
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: All inputs validated using express-validator
- **Error Handling**: Custom error classes with proper status codes
- **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and numbers
- **Protected Routes**: All sensitive endpoints require authentication
- **User Isolation**: Users can only access their own expenses

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information" // Only in development mode
}
```

**Common Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment mode | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Admin SDK credentials (JSON) | Yes | - |
| `CORS_ORIGIN` | Allowed CORS origins | No | * |

## Validation Rules

### User Registration
- Email: Valid email format
- Password: Minimum 6 characters, must contain uppercase, lowercase, and number

### Expense Creation
- Title: Required, max 200 characters
- Amount: Required, positive number > 0
- Category: Required, must be one of the valid categories
- Date: Optional, must be valid ISO 8601 date
- Notes: Optional, max 500 characters
- Payment Method: Optional, must be one of the valid payment methods

## Database Schemas

### User Schema
```javascript
{
  firebaseUid: String (unique, indexed),
  email: String (unique, lowercase),
  displayName: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Schema
```javascript
{
  userId: String (indexed, reference to User),
  title: String (max 200 chars),
  amount: Number (positive),
  category: String (enum),
  date: Date (indexed),
  notes: String (max 500 chars),
  paymentMethod: String (enum),
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or your Atlas cluster is accessible
- Check if the connection string is correct
- For Atlas, whitelist your IP address

### Firebase Authentication Issues
- Verify the service account JSON is properly formatted (single line)
- Ensure Firebase Authentication is enabled in your project
- Check if the token hasn't expired

### Port Already in Use
```bash
# Change the PORT in .env file or
# Kill the process using the port (Windows):
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Development Notes

- The API uses MongoDB aggregation pipelines for efficient report generation
- All dates are stored in UTC
- Expenses are soft-deleted (you can modify to implement hard delete)
- The API supports pagination for better performance with large datasets

