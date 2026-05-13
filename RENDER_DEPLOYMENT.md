# Render.com Deployment Guide - Environment Variables

## 📋 Environment Variables to Add in Render Dashboard

When you create your web service on Render, you'll need to add these **7 environment variables** in the "Environment" section:

---

### 1. **MONGO_URL** (Required)
**What it is:** Your MongoDB connection string

**Where to get it:**
1. Go to https://cloud.mongodb.com
2. Sign up/login (FREE account)
3. Create FREE cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

**Format:**
```
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Example value to paste in Render:**
```
mongodb+srv://skapa_admin:MySecurePass123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

📝 **Note:** Replace `USERNAME` and `PASSWORD` with your actual MongoDB credentials

---

### 2. **DB_NAME** (Required)
**What it is:** Name of your database

**Value to use:**
```
skapa
```

---

### 3. **SPOTIFY_CLIENT_ID** (Required)
**What it is:** Your Spotify app client ID

**Where to get it:**
1. Go to https://developer.spotify.com/dashboard
2. Login with Spotify account
3. Click "Create app"
4. App name: `SKAPA`
5. Redirect URI: `https://skapa-backend.onrender.com/api/auth/callback`
6. Copy the **Client ID**

**Example value:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 4. **SPOTIFY_CLIENT_SECRET** (Required)
**What it is:** Your Spotify app secret key

**Where to get it:**
1. Same Spotify Developer Dashboard
2. Click "Show Client Secret"
3. Copy it

**Example value:**
```
z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4
```

---

### 5. **JWT_SECRET** (Required)
**What it is:** Secret key for user session tokens

**How to generate:**
Run this command on your computer:
```bash
openssl rand -base64 32
```

**Example value:**
```
8xK9mP2vQ7wR5nL3jH6fD4sA1zX0cV8yT5uI2oP9mK7wN4bM6
```

📝 **Or I can generate one for you - just ask!**

---

### 6. **TOKEN_ENCRYPTION_KEY** (Required)
**What it is:** Key to encrypt Spotify refresh tokens in database

**How to generate:**
Run this command on your computer:
```bash
openssl rand -base64 32
```

**Example value:**
```
bN7mK4jH9fD2sA6zX3cV8yT1uI5oP0wR7nL9mP2vQ6kE4xJ8
```

📝 **Or I can generate one for you - just ask!**

---

### 7. **CORS_ORIGINS** (Required)
**What it is:** Which domains can access your API

**Value to use:**
```
*
```

📝 This allows all origins (good for development). Later you can restrict it.

---

## 🎯 Quick Copy-Paste Template

Here's a checklist format you can use:

```
✅ MONGO_URL = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
✅ DB_NAME = skapa
✅ SPOTIFY_CLIENT_ID = your_client_id_here
✅ SPOTIFY_CLIENT_SECRET = your_client_secret_here
✅ JWT_SECRET = (generate with: openssl rand -base64 32)
✅ TOKEN_ENCRYPTION_KEY = (generate with: openssl rand -base64 32)
✅ CORS_ORIGINS = *
```

---

## 🚀 Step-by-Step Render Deployment

### Step 1: Push to GitHub
1. Go to https://github.com/new
2. Create repository: `skapa-backend`
3. Push your code (I can help with this)

### Step 2: Create Render Service
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your `skapa-backend` repo
5. Settings:
   - **Name:** `skapa-backend`
   - **Region:** Singapore (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** Leave blank
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

### Step 3: Add Environment Variables
1. Scroll down to "Environment Variables"
2. Click "Add Environment Variable"
3. Add all 7 variables from above (one by one)

### Step 4: Deploy!
1. Click "Create Web Service"
2. Wait 3-5 minutes for build
3. Your backend URL: `https://skapa-backend.onrender.com`

### Step 5: Test
```bash
curl https://skapa-backend.onrender.com/api/health
```

Should return: `{"ok": true, "service": "skapa", "version": "0.1.0"}`

---

## 🆘 Need Help?

### I don't have MongoDB Atlas
**I'll guide you:**
1. Go to https://cloud.mongodb.com
2. Sign up (FREE)
3. Create FREE M0 cluster
4. Takes 2 minutes

### I don't have Spotify credentials
**I'll guide you:**
1. Go to https://developer.spotify.com/dashboard
2. Login with Spotify
3. Create app
4. Takes 1 minute

### I can't run openssl command
**I'll generate the secrets for you!** Just ask and I'll provide them.

### I don't have GitHub repo
**I'll create commit commands for you!** Just ask.

---

## 💰 Cost

- **Render.com:** FREE (750 hours/month)
- **MongoDB Atlas:** FREE (M0 tier, 512MB)
- **Spotify API:** FREE
- **Total:** $0/month 🎉

---

## ⏰ Time Estimate

- MongoDB setup: 2 minutes
- Spotify credentials: 1 minute
- Generate secrets: 30 seconds
- Render deployment: 5 minutes
- **Total: ~10 minutes**

---

**Ready to deploy? Let me know what you need help with!**
