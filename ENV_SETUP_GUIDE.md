# 🎯 Quick Setup Guide - Fill Your .env Files

## ✅ Files Created:
1. `/app/backend/.env` - Backend configuration
2. `/app/.env` - Frontend configuration

---

## 📝 What You Need to Do:

### Step 1: Get MongoDB Connection String (2 minutes)

1. Go to **https://cloud.mongodb.com**
2. Sign up (FREE account)
3. Click **"Build a Database"** → Choose **FREE M0 tier**
4. Click **"Create Cluster"** (wait 1-2 minutes)
5. Go to **"Database Access"** → Click **"Add New Database User"**
   - Username: `skapa_admin`
   - Password: Click **"Autogenerate Secure Password"** → **COPY IT!**
   - Set privilege: **"Read and write to any database"**
   - Click **"Add User"**
6. Go to **"Network Access"** → Click **"Add IP Address"**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**
7. Go back to **"Database"** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Copy the connection string (looks like):
     ```
     mongodb+srv://skapa_admin:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with the password you copied in step 5

8. **Open `/app/backend/.env`** and paste your connection string in `MONGO_URL`

---

### Step 2: Get Spotify Credentials (1 minute)

1. Go to **https://developer.spotify.com/dashboard**
2. Login with your Spotify account
3. Click **"Create app"**
   - App name: `SKAPA`
   - App description: `Social music app`
   - Redirect URI: `http://localhost:8001/api/auth/callback`
   - Check **"Web API"**
   - Click **"Save"**
4. You'll see your **Client ID** - **COPY IT!**
5. Click **"Show Client Secret"** - **COPY IT!**

6. **Open `/app/backend/.env`** and paste:
   - Client ID in `SPOTIFY_CLIENT_ID`
   - Client Secret in `SPOTIFY_CLIENT_SECRET`

---

### Step 3: Your .env is Ready! ✅

Your `/app/backend/.env` should now look like:

```env
MONGO_URL=mongodb+srv://skapa_admin:YourActualPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
DB_NAME=skapa
SPOTIFY_CLIENT_ID=abc123def456ghi789
SPOTIFY_CLIENT_SECRET=xyz789uvw456rst123
JWT_SECRET=4HUCRf3eVpM37NQsWuAwS7QxsifW4VIw8QRRufJoY2Q=
TOKEN_ENCRYPTION_KEY=E2UVz8xyWNsQxNDvI1li+kBgZGf2C22AUeXMFSOBsEA=
CORS_ORIGINS=*
```

---

## 🚀 Next: Deploy to Render.com

Now that your `.env` is ready, you need to add these same values to **Render.com**:

### For Render.com Environment Variables:

When you create your web service on Render, add these 7 variables:

| Variable Name | Value (from your .env) |
|--------------|------------------------|
| `MONGO_URL` | (paste your MongoDB connection string) |
| `DB_NAME` | `skapa` |
| `SPOTIFY_CLIENT_ID` | (paste your Spotify client ID) |
| `SPOTIFY_CLIENT_SECRET` | (paste your Spotify client secret) |
| `JWT_SECRET` | `4HUCRf3eVpM37NQsWuAwS7QxsifW4VIw8QRRufJoY2Q=` |
| `TOKEN_ENCRYPTION_KEY` | `E2UVz8xyWNsQxNDvI1li+kBgZGf2C22AUeXMFSOBsEA=` |
| `CORS_ORIGINS` | `*` |

---

## 🧪 Test Locally (Optional)

Before deploying, you can test locally:

```bash
# Terminal 1 - Backend
cd /app
source venv/bin/activate  # or: python -m venv venv && source venv/bin/activate
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Terminal 2 - Frontend
cd /app
npm install
npx expo start
```

---

## 🆘 Need Help?

**MongoDB not working?**
- Make sure you replaced `<password>` in the connection string
- Check that Network Access allows 0.0.0.0/0

**Spotify not working?**
- Make sure you copied the full Client ID and Secret
- No spaces before/after the values

**Still stuck?**
- Share the error message and I'll help! 🎯

---

## ✅ Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string added to `.env`
- [ ] Spotify app created
- [ ] Spotify credentials added to `.env`
- [ ] Ready to deploy to Render.com!

**Once you've filled in MongoDB and Spotify values, you're ready to deploy!** 🚀
