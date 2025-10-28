# Complete .env Setup Guide

This guide will walk you through setting up your `.env` file with all required credentials.

---

## Overview

Your `.env` file should contain these 5 variables:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
FIREBASE_SERVICE_ACCOUNT_KEY=your-firebase-json-credentials
CORS_ORIGIN=*
```

---

## Step-by-Step Setup

### Step 1: Basic Configuration

Open your `.env` file and set these basic values:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*
```

**What they mean:**
- `PORT`: The port your server will run on (default: 5000)
- `NODE_ENV`: Environment mode (`development` or `production`)
- `CORS_ORIGIN`: Allowed origins for CORS (`*` means allow all)

---

### Step 2: MongoDB Setup

You have two options: Local MongoDB or MongoDB Atlas (Cloud)

#### Option A: Local MongoDB (Easiest for Development)

If you have MongoDB installed locally:

```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
```

**To install MongoDB locally:**
- Windows: Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**To start MongoDB:**
- Windows: MongoDB starts automatically or run `mongod`
- Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Go to MongoDB Atlas**
   - Visit: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Click "Try Free" and create an account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select a cloud provider and region (closest to you)
   - Name your cluster (default is fine)
   - Click "Create"

3. **Create Database User**
   - Click "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `expenseuser` (or any name you want)
   - Password: Click "Autogenerate Secure Password" and COPY IT
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist Your IP**
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `expense-tracker`

**Example connection string:**
```env
MONGODB_URI=mongodb+srv://expenseuser:MyPassword123@cluster0.abc123.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

Add this to your `.env` file.

---

### Step 3: Firebase Setup (MOST IMPORTANT)

#### Part A: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: [console.firebase.google.com](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create a Project**
   - Click "Add project"
   - Project name: `expense-tracker-app` (or any name)
   - Disable Google Analytics (unless you want it)
   - Click "Create project"

#### Part B: Enable Email/Password Authentication

1. **In your Firebase project:**
   - Click "Authentication" in left sidebar
   - Click "Get started"
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

#### Part C: Generate Service Account Key

1. **Go to Project Settings**
   - Click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"

2. **Go to Service Accounts**
   - Click "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" (a JSON file will download)

3. **Save the JSON file securely**
   - The file will be named something like `expense-tracker-app-firebase-adminsdk-xxxxx.json`
   - **IMPORTANT:** Keep this file safe, don't share it publicly!

#### Part D: Convert JSON to Single Line

The Firebase JSON looks like this:

```json
{
  "type": "service_account",
  "project_id": "expense-tracker-app-12345",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@expense-tracker-app-12345.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40expense-tracker-app-12345.iam.gserviceaccount.com"
}
```

**You need to convert this to a SINGLE LINE:**

**Method 1: Using a Text Editor**
1. Open the downloaded JSON file in a text editor
2. Remove ALL line breaks (make it one continuous line)
3. Copy the entire single line

**Method 2: Using Online Tool**
1. Go to [jsonformatter.org/json-minify](https://jsonformatter.org/json-minify)
2. Paste your JSON
3. Click "Minify"
4. Copy the result

**Method 3: Using VS Code**
1. Open the JSON file in VS Code
2. Select all (Ctrl+A)
3. Open Command Palette (Ctrl+Shift+P)
4. Type "Join Lines" and select it
5. Copy the result

**The result should look like:**
```
{"type":"service_account","project_id":"expense-tracker-app-12345","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk@...","client_id":"12345...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40..."}
```

#### Part E: Add to .env

In your `.env` file, add:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"expense-tracker-app-12345",...entire single line here...}
```

**IMPORTANT:**
- The entire JSON must be on ONE line
- Don't add extra quotes around it
- Don't break it into multiple lines

---

## Complete .env Example

Here's what your complete `.env` file should look like:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://expenseuser:MyPassword123@cluster0.abc123.mongodb.net/expense-tracker?retryWrites=true&w=majority

# Firebase Admin SDK Configuration (MUST BE ON ONE LINE)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"expense-tracker-app-12345","private_key_id":"abc123def456","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@expense-tracker-app.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk%40expense-tracker-app.iam.gserviceaccount.com"}

# CORS Configuration
CORS_ORIGIN=*
```

---

## Quick Setup Checklist

- [ ] Set `PORT=5000`
- [ ] Set `NODE_ENV=development`
- [ ] Set up MongoDB (local or Atlas)
- [ ] Add `MONGODB_URI` connection string
- [ ] Create Firebase project
- [ ] Enable Email/Password authentication
- [ ] Download Firebase service account key
- [ ] Convert Firebase JSON to single line
- [ ] Add `FIREBASE_SERVICE_ACCOUNT_KEY` to .env
- [ ] Set `CORS_ORIGIN=*`
- [ ] Save `.env` file

---

## Verification

After setting up your `.env`, verify it works:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```

3. **You should see:**
   ```
   ==================================================
   Server running in development mode
   Server listening on port 5000
   API URL: http://localhost:5000
   ==================================================
   MongoDB Connected: ...
   Database Name: expense-tracker
   Firebase Admin SDK initialized successfully
   ```

4. **Test health endpoint:**
   - Open browser: http://localhost:5000/health
   - Should show: `{"success":true,"status":"healthy"...}`

---

## Common Issues & Solutions

### Issue: "MongoDB connection error"

**Solution:**
- Check your `MONGODB_URI` for typos
- Verify password doesn't contain special characters (or URL encode them)
- For Atlas: Check IP whitelist in Network Access
- For local: Ensure MongoDB is running (`mongod`)

### Issue: "Failed to initialize Firebase Admin SDK"

**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is on ONE line
- Check for missing quotes or brackets
- Ensure the JSON is valid (test at jsonlint.com)
- Verify you copied the entire service account key

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install
```

### Issue: Port already in use

**Solution:**
- Change `PORT` to another number (e.g., 3000, 8000)
- Or kill process using port 5000

---

## Security Tips

1. **NEVER commit `.env` to Git**
   - It's already in `.gitignore`
   - Don't share it publicly

2. **Use different credentials for production**
   - Create separate Firebase projects for dev/prod
   - Use different MongoDB databases

3. **Rotate credentials regularly**
   - Change passwords periodically
   - Regenerate Firebase keys if compromised

4. **Restrict CORS in production**
   ```env
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

---

## Need Help?

1. Check the main [README.md](README.md) for troubleshooting
2. Review [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
3. Ensure all services (MongoDB, Firebase) are properly set up

---

## Quick Reference

**Minimum required .env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-uri
FIREBASE_SERVICE_ACCOUNT_KEY=your-firebase-json-single-line
CORS_ORIGIN=*
```

**All 5 variables are REQUIRED for the application to run.**

---

Good luck! Once your `.env` is set up correctly, you're ready to start the server and test the API! 🚀
