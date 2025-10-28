# Expense Tracker Backend API Documentation

**Version:** 1.0.0
**Author:** Riha
**Last Updated:** October 27, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Expense Management Endpoints](#expense-management-endpoints)
   - [Report Endpoints](#report-endpoints)
   - [Health Check Endpoints](#health-check-endpoints)
6. [Data Models](#data-models)
7. [Status Codes](#status-codes)
8. [Examples](#examples)

---

## Overview

The Expense Tracker Backend API is a RESTful API built with Node.js, Express, and MongoDB. It provides comprehensive expense tracking capabilities with Firebase Authentication for secure user management.

### Key Features

- Firebase-based user authentication
- Complete CRUD operations for expense management
- Advanced filtering and pagination
- Detailed expense reports and analytics
- Category-based expense tracking
- Monthly summaries with aggregation

---

## Base URL

```
http://localhost:5000
```

For production, replace with your deployed server URL.

---

## Authentication

The API uses Firebase Authentication with Bearer token authorization.

### Authorization Header Format

```
Authorization: Bearer <firebase-id-token>
```

### Getting a Firebase ID Token

1. **Register a new user** using the `/api/register` endpoint
2. Use Firebase Client SDK to sign in and get an ID token
3. Include the token in the Authorization header for protected routes

### Protected Routes

All endpoints except the following require authentication:
- `POST /api/register`
- `POST /api/login`
- `GET /` (health check)
- `GET /health`

---

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common Errors

| Error | Status Code | Description |
|-------|-------------|-------------|
| Missing Authorization header | 401 | No token provided |
| Invalid token | 401 | Token is malformed or invalid |
| Token expired | 401 | Token has expired, login again |
| Validation error | 400 | Input validation failed |
| Resource not found | 404 | Requested resource doesn't exist |
| Server error | 500 | Internal server error |

---

## API Endpoints

### Authentication Endpoints

#### 1. Register New User

**Endpoint:** `POST /api/register`

**Description:** Register a new user with email and password.

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe" // optional
}
```

**Validation Rules:**
- Email: Must be a valid email format
- Password: Minimum 6 characters, must contain uppercase, lowercase, and number
- Display Name: Optional, any string

**Success Response (201):**

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

**Error Response (400):**

```json
{
  "success": false,
  "message": "Email already registered",
  "error": "Email already exists"
}
```

---

#### 2. Login User

**Endpoint:** `POST /api/login`

**Description:** Login user and verify Firebase ID token.

**Access:** Public

**Request Body:**

```json
{
  "email": "user@example.com",
  "idToken": "firebase-id-token"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "lastLogin": "2025-01-15T10:30:00.000Z",
    "token": "firebase-id-token"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Token verification failed",
  "error": "Invalid token"
}
```

---

#### 3. Get User Profile

**Endpoint:** `GET /api/profile`

**Description:** Get current user profile information.

**Access:** Private (requires authentication)

**Headers:**

```
Authorization: Bearer <firebase-id-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "uid": "firebase-uid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "lastLogin": "2025-01-15T10:30:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

#### 4. Logout User

**Endpoint:** `POST /api/logout`

**Description:** Logout user and revoke all refresh tokens.

**Access:** Private (requires authentication)

**Headers:**

```
Authorization: Bearer <firebase-id-token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful. All refresh tokens have been revoked.",
  "data": {
    "uid": "firebase-uid",
    "tokensValidAfterTime": 1705318200
  }
}
```

---

### Expense Management Endpoints

#### 1. Get All Expenses

**Endpoint:** `GET /api/expenses`

**Description:** Get all expenses for the logged-in user with optional filtering, sorting, and pagination.

**Access:** Private (requires authentication)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category |
| startDate | ISO 8601 | No | Filter expenses from this date |
| endDate | ISO 8601 | No | Filter expenses until this date |
| sortBy | string | No | Sort field (default: 'date') |
| order | string | No | Sort order: 'asc' or 'desc' (default: 'desc') |
| limit | number | No | Results per page |
| page | number | No | Page number (default: 1) |

**Example Request:**

```
GET /api/expenses?category=Food&sortBy=amount&order=desc&limit=10&page=1
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "expenses": [
      {
        "_id": "expense-id",
        "userId": "firebase-uid",
        "title": "Grocery Shopping",
        "amount": 150.50,
        "category": "Food",
        "date": "2025-01-15T10:30:00.000Z",
        "notes": "Weekly groceries",
        "paymentMethod": "Credit Card",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "updatedAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalExpenses": 45,
      "expensesPerPage": 10
    },
    "summary": {
      "totalExpenses": 45,
      "totalAmount": 2340.75
    }
  }
}
```

---

#### 2. Get Single Expense

**Endpoint:** `GET /api/expenses/:id`

**Description:** Get a single expense by its ID.

**Access:** Private (requires authentication)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | MongoDB ObjectId | Expense ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Expense retrieved successfully",
  "data": {
    "_id": "expense-id",
    "userId": "firebase-uid",
    "title": "Grocery Shopping",
    "amount": 150.50,
    "category": "Food",
    "date": "2025-01-15T10:30:00.000Z",
    "notes": "Weekly groceries",
    "paymentMethod": "Credit Card",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Expense not found or unauthorized",
  "error": "Expense not found"
}
```

---

#### 3. Create Expense

**Endpoint:** `POST /api/expenses`

**Description:** Create a new expense.

**Access:** Private (requires authentication)

**Request Body:**

```json
{
  "title": "Grocery Shopping",
  "amount": 150.50,
  "category": "Food",
  "date": "2025-01-15T10:30:00Z", // optional
  "notes": "Weekly groceries", // optional
  "paymentMethod": "Credit Card" // optional
}
```

**Valid Categories:**
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

**Valid Payment Methods:**
- Cash
- Credit Card
- Debit Card
- UPI
- Net Banking
- Other

**Validation Rules:**
- Title: Required, max 200 characters
- Amount: Required, positive number > 0
- Category: Required, must be one of valid categories
- Date: Optional, defaults to current time, must be ISO 8601 format
- Notes: Optional, max 500 characters
- Payment Method: Optional, defaults to 'Other'

**Success Response (201):**

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "new-expense-id",
    "userId": "firebase-uid",
    "title": "Grocery Shopping",
    "amount": 150.50,
    "category": "Food",
    "date": "2025-01-15T10:30:00.000Z",
    "notes": "Weekly groceries",
    "paymentMethod": "Credit Card",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

---

#### 4. Update Expense

**Endpoint:** `PUT /api/expenses/:id`

**Description:** Update an existing expense.

**Access:** Private (requires authentication)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | MongoDB ObjectId | Expense ID |

**Request Body (all fields optional):**

```json
{
  "title": "Updated Title",
  "amount": 200.00,
  "category": "Shopping",
  "date": "2025-01-16T10:30:00Z",
  "notes": "Updated notes",
  "paymentMethod": "Debit Card"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "_id": "expense-id",
    "userId": "firebase-uid",
    "title": "Updated Title",
    "amount": 200.00,
    "category": "Shopping",
    "date": "2025-01-16T10:30:00.000Z",
    "notes": "Updated notes",
    "paymentMethod": "Debit Card",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-16T12:00:00.000Z"
  }
}
```

---

#### 5. Delete Expense

**Endpoint:** `DELETE /api/expenses/:id`

**Description:** Delete an expense.

**Access:** Private (requires authentication)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | MongoDB ObjectId | Expense ID |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {
    "deletedExpense": {
      "_id": "expense-id",
      "title": "Grocery Shopping",
      "amount": 150.50
    }
  }
}
```

---

### Report Endpoints

#### 1. Monthly Report

**Endpoint:** `GET /api/reports/monthly`

**Description:** Get monthly expense summary with category breakdown using MongoDB aggregation.

**Access:** Private (requires authentication)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| month | number | Yes | Month (1-12) |
| year | number | Yes | Year (2000-2100) |

**Example Request:**

```
GET /api/reports/monthly?month=1&year=2025
```

**Success Response (200):**

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
        },
        {
          "category": "Entertainment",
          "amount": 250.75,
          "count": 2,
          "percentage": 20.06
        },
        {
          "category": "Bills",
          "amount": 250.00,
          "count": 1,
          "percentage": 19.98
        }
      ]
    },
    "expenses": [...]
  }
}
```

---

#### 2. Category Report

**Endpoint:** `GET /api/reports/category`

**Description:** Get expenses filtered by category with statistics and trend analysis.

**Access:** Private (requires authentication)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | Yes | Category name |
| startDate | ISO 8601 | No | Filter from date |
| endDate | ISO 8601 | No | Filter to date |

**Example Request:**

```
GET /api/reports/category?category=Food&startDate=2025-01-01&endDate=2025-01-31
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Category report for Food generated successfully",
  "data": {
    "category": "Food",
    "statistics": {
      "totalExpenses": 25,
      "totalAmount": 1250.50,
      "averageAmount": 50.02,
      "maxExpense": 200.00,
      "minExpense": 15.50
    },
    "monthlyTrend": [
      {
        "month": "2025-01",
        "total": 450.00,
        "count": 8,
        "average": 56.25
      },
      {
        "month": "2025-02",
        "total": 380.50,
        "count": 7,
        "average": 54.36
      }
    ],
    "expenses": [...]
  }
}
```

---

#### 3. Overall Statistics

**Endpoint:** `GET /api/reports/stats`

**Description:** Get overall expense statistics with category and payment method breakdown.

**Access:** Private (requires authentication)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | ISO 8601 | No | Filter from date |
| endDate | ISO 8601 | No | Filter to date |

**Example Request:**

```
GET /api/reports/stats?startDate=2025-01-01&endDate=2025-12-31
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Overall statistics generated successfully",
  "data": {
    "overall": {
      "totalExpenses": 120,
      "totalAmount": 15340.75,
      "averageAmount": 127.84,
      "maxAmount": 1200.00,
      "minAmount": 5.50
    },
    "categoryBreakdown": [
      {
        "category": "Food",
        "total": 4500.00,
        "count": 45,
        "percentage": 29.33
      },
      {
        "category": "Transportation",
        "total": 3200.00,
        "count": 28,
        "percentage": 20.86
      }
    ],
    "paymentMethodBreakdown": [
      {
        "paymentMethod": "Credit Card",
        "total": 8500.00,
        "count": 65,
        "percentage": 55.41
      },
      {
        "paymentMethod": "Cash",
        "total": 4200.75,
        "count": 35,
        "percentage": 27.39
      }
    ]
  }
}
```

---

### Health Check Endpoints

#### 1. Root Endpoint

**Endpoint:** `GET /`

**Description:** Check if the API is running.

**Access:** Public

**Success Response (200):**

```json
{
  "success": true,
  "message": "Expense Tracker API is running",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

#### 2. Health Check

**Endpoint:** `GET /health`

**Description:** Check server and database health status.

**Access:** Public

**Success Response (200):**

```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "uptime": 3600.5,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Data Models

### User Model

```javascript
{
  firebaseUid: String (unique, indexed),
  email: String (unique, lowercase),
  displayName: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

### Expense Model

```javascript
{
  userId: String (indexed, reference to User),
  title: String (required, max 200 chars),
  amount: Number (required, positive),
  category: String (required, enum),
  date: Date (indexed, default: current time),
  notes: String (max 500 chars),
  paymentMethod: String (enum, default: 'Other'),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Examples

### Complete Workflow Example

#### Step 1: Register a User

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "displayName": "John Doe"
  }'
```

#### Step 2: Use Custom Token to Get ID Token

Use Firebase Client SDK or Admin SDK to exchange the custom token for an ID token.

#### Step 3: Create an Expense

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -d '{
    "title": "Lunch at Restaurant",
    "amount": 45.50,
    "category": "Food",
    "notes": "Business lunch",
    "paymentMethod": "Credit Card"
  }'
```

#### Step 4: Get All Expenses

```bash
curl -X GET "http://localhost:5000/api/expenses?sortBy=date&order=desc" \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

#### Step 5: Get Monthly Report

```bash
curl -X GET "http://localhost:5000/api/reports/monthly?month=1&year=2025" \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

---

## Notes

1. **Date Format**: All dates must be in ISO 8601 format
2. **Authentication**: All protected routes require a valid Firebase ID token
3. **Pagination**: Use `limit` and `page` parameters for large datasets
4. **Filtering**: Combine multiple query parameters for advanced filtering
5. **Time Zone**: All dates are stored and returned in UTC

---

## Support

For issues and questions:
- GitHub: Create an issue in the repository
- Email: Contact the maintainer

---

**Documentation Version:** 1.0.0
**API Version:** 1.0.0
**Last Updated:** October 27, 2025
