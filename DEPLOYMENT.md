# SKAPA Backend Deployment Guide - Fly.io + MongoDB Atlas

This guide will help you deploy the SKAPA backend to Fly.io with MongoDB Atlas.

---

## Prerequisites

1. ✅ Fly.io account (you have this)
2. ✅ MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas/register)
3. ✅ Spotify Developer account with app credentials

---

## Part 1: Set Up MongoDB Atlas (5 minutes)

### Step 1: Create MongoDB Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register and sign in
2. Click **"Build a Database"**
3. Choose **"FREE" tier** (M0 Sandbox - no credit card required)
4. Select your preferred region (choose one close to your Fly.io region for lower latency)
5. Click **"Create Cluster"** (wait 1-3 minutes)

### Step 2: Configure Database Access

1. On the left sidebar, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set username: `skapa_admin`
5. Click **"Autogenerate Secure Password"** and **copy it** (you'll need this!)
6. Set **"Database User Privileges"** to **"Atlas admin"**
7. Click **"Add User"**

### Step 3: Configure Network Access

1. On the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is safe for development; for production, you can restrict to Fly.io IPs later
4. Click **"Confirm"**

### Step 4: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Driver: Python"** and **"Version: 3.11 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://skapa_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>` with the password you copied earlier**
7. Save this - you'll use it as `MONGO_URL`

### Step 5: Create Database

1. Click **"Browse Collections"** on your cluster
2. Click **"Add My Own Data"**
3. Database name: `skapa`
4. Collection name: `users`
5. Click **"Create"**

**✅ MongoDB Atlas Setup Complete!**

Your connection string should look like:
```
mongodb+srv://skapa_admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Part 2: Deploy to Fly.io

### Step 1: Install Fly.io CLI

**On macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**On Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

After installation, add to PATH if needed:
- macOS/Linux: Add `~/.fly/bin` to your PATH
- Windows: Add `%USERPROFILE%\.fly\bin` to PATH

### Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser. Sign in with your Fly.io account.

### Step 3: Generate Encryption Keys

You need to generate secure keys for JWT and token encryption:

```bash
# Generate JWT secret (32 random characters)
openssl rand -base64 32

# Generate Token Encryption Key (32 bytes, base64 encoded)
openssl rand -base64 32
```

**Save both outputs - you'll need them in the next step!**

### Step 4: Set Environment Variables (SECRETS)

Replace the values below with your actual credentials:

```bash
# Navigate to project directory
cd /app

# Set MongoDB connection string (from MongoDB Atlas Step 4)
flyctl secrets set MONGO_URL="mongodb+srv://skapa_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"

# Set database name
flyctl secrets set DB_NAME="skapa"

# Set Spotify credentials (get from https://developer.spotify.com/dashboard)
flyctl secrets set SPOTIFY_CLIENT_ID="your_spotify_client_id"
flyctl secrets set SPOTIFY_CLIENT_SECRET="your_spotify_client_secret"

# Set JWT secret (from Step 3)
flyctl secrets set JWT_SECRET="your_generated_jwt_secret"

# Set Token Encryption Key (from Step 3)
flyctl secrets set TOKEN_ENCRYPTION_KEY="your_generated_encryption_key"

# Set CORS origins (allows all for now)
flyctl secrets set CORS_ORIGINS="*"
```

### Step 5: Configure Fly.io App

```bash
# Create the app (one-time setup)
flyctl apps create skapa-backend

# Optional: Choose your preferred region (default is closest to you)
# Available regions: sin (Singapore), bom (Mumbai), iad (US East), lhr (London), etc.
# Edit fly.toml and change 'primary_region' if needed
```

### Step 6: Deploy!

```bash
# Deploy the backend
flyctl deploy

# This will:
# - Build the Docker image
# - Push it to Fly.io
# - Start your app
# - Takes 2-5 minutes
```

### Step 7: Get Your Backend URL

After deployment completes:

```bash
flyctl info
```

Your app URL will be: `https://skapa-backend.fly.dev`

**Test it:**
```bash
curl https://skapa-backend.fly.dev/api/health
```

You should see:
```json
{"ok": true, "service": "skapa", "version": "0.1.0"}
```

### Step 8: Monitor Logs (Optional)

```bash
# View real-time logs
flyctl logs

# You should see:
# - "[SKAPA] Started listening events polling..."
# - "[Listening Events] Polling X users..."
```

---

## Part 3: Update Mobile App

Update the backend URL in your Expo app:

1. Create or edit `.env` file in `/app` directory:

```bash
EXPO_PUBLIC_BACKEND_URL=https://skapa-backend.fly.dev
```

2. Restart Expo:

```bash
npx expo start --clear
```

**✅ Done! Your mobile app can now connect to the backend!**

---

## Part 4: Verify Everything Works

### Test Listening Events API

```bash
# Get listening stats
curl https://skapa-backend.fly.dev/api/listening/stats

# Get active listening events
curl https://skapa-backend.fly.dev/api/listening/events
```

### Test WebSocket (Rooms)

WebSocket connections should now work from your mobile app! The `/ws/rooms/{code}` endpoint is fully functional on Fly.io.

---

## Useful Commands

```bash
# View logs
flyctl logs

# SSH into the container
flyctl ssh console

# Scale resources (if needed)
flyctl scale memory 1024  # Increase to 1GB RAM

# Restart app
flyctl apps restart skapa-backend

# Check status
flyctl status

# Update secrets
flyctl secrets set VARIABLE_NAME="new_value"

# View all secrets
flyctl secrets list
```

---

## Troubleshooting

### Issue: "failed to fetch an image or build from source"

**Solution:** Make sure you're in the `/app` directory where `Dockerfile` and `fly.toml` are located.

### Issue: "connection refused" or "502 Bad Gateway"

**Solution:** 
1. Check logs: `flyctl logs`
2. Verify MongoDB connection string is correct
3. Ensure all secrets are set: `flyctl secrets list`

### Issue: "Spotify auth not working"

**Note:** You need Spotify Premium to use the Spotify API's currently-playing endpoint. Non-premium accounts will return 403 errors.

**Temporary Solution:** The listening events system gracefully handles this - it just won't show data until you have Premium.

### Issue: MongoDB connection timeout

**Solution:**
1. Verify MongoDB Atlas Network Access allows 0.0.0.0/0
2. Check if MongoDB password contains special characters - if so, URL-encode them:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`

---

## Cost Estimate

- **MongoDB Atlas:** FREE (M0 tier - 512MB storage)
- **Fly.io:** FREE for 1 app with:
  - 3 shared-cpu-1x VMs (256MB RAM each)
  - 160GB outbound data transfer/month
  - Your current config uses 512MB RAM, so it's within free tier

**Total: $0/month** 🎉

---

## Next Steps

1. ✅ Deploy backend to Fly.io
2. ✅ Connect mobile app to Fly.io backend URL
3. ✅ Test listening events on the map
4. Get Spotify Premium (tomorrow) to enable real listening data
5. Share with friends and test multiplayer features!

---

## Support

- Fly.io Docs: https://fly.io/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- SKAPA Backend API: `https://skapa-backend.fly.dev/docs` (auto-generated)

---

**🚀 Ready to deploy? Start with Part 1: MongoDB Atlas Setup!**
