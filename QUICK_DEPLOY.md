# SKAPA - Quick Deployment Checklist

## Before You Start
- [ ] Fly.io account created and logged in
- [ ] MongoDB Atlas account created
- [ ] Spotify Developer credentials ready

---

## Step 1: MongoDB Atlas (5 minutes)

1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Create database user: `skapa_admin` + password
4. Network Access: Allow `0.0.0.0/0`
5. Get connection string: `mongodb+srv://skapa_admin:PASSWORD@cluster0.xxxxx.mongodb.net/`
6. Create database: `skapa` with collection: `users`

**✅ Save your MongoDB connection string!**

---

## Step 2: Install Fly.io CLI (2 minutes)

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows PowerShell
iwr https://fly.io/install.ps1 -useb | iex

# Login
flyctl auth login
```

---

## Step 3: Generate Secrets (1 minute)

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32
```

**✅ Save both outputs!**

---

## Step 4: Deploy Backend (5 minutes)

```bash
cd /app

# Create app (one-time)
flyctl apps create skapa-backend

# Set all secrets (replace with your values)
flyctl secrets set \
  MONGO_URL="mongodb+srv://skapa_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority" \
  DB_NAME="skapa" \
  SPOTIFY_CLIENT_ID="your_spotify_client_id" \
  SPOTIFY_CLIENT_SECRET="your_spotify_client_secret" \
  JWT_SECRET="your_generated_jwt_secret_from_step3" \
  TOKEN_ENCRYPTION_KEY="your_generated_encryption_key_from_step3" \
  CORS_ORIGINS="*"

# Deploy!
flyctl deploy

# Wait 2-3 minutes...
```

---

## Step 5: Verify Deployment (1 minute)

```bash
# Test health endpoint
curl https://skapa-backend.fly.dev/api/health

# Should return: {"ok": true, "service": "skapa", "version": "0.1.0"}

# Check listening events
curl https://skapa-backend.fly.dev/api/listening/events

# Should return: {"events": [], "count": 0}
```

---

## Step 6: Update Mobile App (1 minute)

```bash
cd /app

# Update .env
echo "EXPO_PUBLIC_BACKEND_URL=https://skapa-backend.fly.dev" > .env

# Restart Expo
npx expo start --clear
```

---

## Step 7: Test on Mobile

1. Open Expo Go app on your phone
2. Scan QR code
3. Navigate to "Map" tab
4. (Tomorrow) Connect Spotify with Premium account
5. Start playing music
6. Within 30 seconds, you appear on the map!

---

## Useful Commands

```bash
# View logs
flyctl logs

# View live logs
flyctl logs -f

# SSH into container
flyctl ssh console

# Check app status
flyctl status

# Restart app
flyctl apps restart skapa-backend

# View secrets (names only, not values)
flyctl secrets list

# Update a secret
flyctl secrets set VARIABLE_NAME="new_value"

# Redeploy after code changes
flyctl deploy
```

---

## Troubleshooting

### "failed to fetch an image"
**Solution:** Make sure you're in `/app` directory with `Dockerfile`

### "connection refused"
**Solution:** 
```bash
# Check logs
flyctl logs

# Verify MongoDB connection string is correct
flyctl secrets list
```

### "Spotify auth not working"
**Note:** You need Spotify Premium. Non-premium accounts get 403 errors.

### MongoDB connection timeout
**Solution:**
1. Check Network Access allows `0.0.0.0/0`
2. URL-encode special characters in password:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`

---

## Cost

- **MongoDB Atlas:** FREE (M0 tier, 512MB)
- **Fly.io:** FREE (1 app, 512MB RAM)
- **Total: $0/month** 🎉

---

## What Happens Next?

1. ✅ Backend is live on Fly.io
2. ✅ Mobile app connects to production backend
3. 🕐 Tomorrow: Get Spotify Premium
4. ✅ Connect Spotify in app
5. ✅ Play music → appear on map in 30 seconds
6. ✅ Invite friends (they need Premium too)
7. 🎉 Everyone sees each other's real-time music!

---

## Need Help?

- 📖 Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 📖 Implementation details: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🏥 Health check: https://skapa-backend.fly.dev/api/health
- 📊 API docs: https://skapa-backend.fly.dev/docs

---

**Ready to deploy? Start with Step 1!** 🚀
