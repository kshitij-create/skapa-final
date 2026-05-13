# 🔧 Render.com Deployment - Error Fix

## ❌ Error You Got:
```
Error [ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING]: Stripping types is currently unsupported for files under node_modules
```

## ✅ Solution: Tell Render to Deploy ONLY Backend

The error happened because Render tried to process the frontend (React Native) code. We only want to deploy the backend (Python/FastAPI).

---

## 🎯 How to Fix (2 Options)

### **Option 1: Update Your Render Service Settings** (Recommended)

Go to your Render dashboard and **update these settings**:

1. Go to your `skapa-backend` service
2. Click **"Settings"** (left sidebar)
3. Scroll to **"Build & Deploy"**
4. **Change these fields:**

| Field | Change To |
|-------|-----------|
| **Root Directory** | `backend` ⚠️ **CRITICAL!** |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |

5. Scroll down and click **"Save Changes"**
6. Go to **"Manual Deploy"** → Click **"Deploy latest commit"**

---

### **Option 2: Use render.yaml** (Alternative)

If Option 1 doesn't work, create a `render.yaml` file in your repo root:

**I've already created this file for you!** Just commit and push:

```bash
git add render.yaml .slugignore
git commit -m "Fix Render deployment config"
git push
```

Render will automatically detect `render.yaml` and use those settings.

---

## 📋 Quick Summary - What Changed:

✅ **Before (Wrong):**
- Root Directory: (empty) ❌
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `cd backend && uvicorn ...`

✅ **After (Correct):**
- Root Directory: `backend` ✅
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

---

## 🚀 Step-by-Step Fix

### Method 1: Update in Render Dashboard (Easiest)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your service**: `skapa-backend`
3. **Click "Settings"** (left sidebar)
4. **Find "Root Directory"**: Change to `backend`
5. **Find "Build Command"**: Change to `pip install -r requirements.txt`
6. **Find "Start Command"**: Change to `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. **Scroll down**: Click **"Save Changes"**
8. **Go to "Manual Deploy"**: Click **"Deploy latest commit"**
9. **Wait 2-3 minutes**: Your deployment should succeed! ✅

---

### Method 2: Push Updated Config Files

I've created/updated these files for you:
- ✅ `render.yaml` - Correct Render configuration
- ✅ `.slugignore` - Tells Render to ignore frontend files

**Just commit and push:**

```bash
# Add the new files
git add render.yaml .slugignore RENDER_DEPLOYMENT.md

# Commit
git commit -m "Fix Render deployment - set root directory to backend"

# Push to GitHub
git push origin main
```

Render will auto-deploy with the correct settings!

---

## ✅ How to Verify It Worked

After redeploying, you should see:

```
✅ Build successful
✅ Starting server...
✅ Application started on port 10000
```

**Test it:**
```bash
curl https://skapa-backend.onrender.com/api/health
```

**Should return:**
```json
{"ok": true, "service": "skapa", "version": "0.1.0"}
```

---

## 🆘 Still Getting Errors?

### Error: "No Python version specified"
**Fix:** In Render dashboard → Settings → Add environment variable:
```
PYTHON_VERSION = 3.11.0
```

### Error: "Module not found"
**Fix:** Make sure Root Directory is set to `backend`

### Error: "Port already in use"
**Fix:** Start command should include `--port $PORT` (not hardcoded 8001)

---

## 💡 Why This Happened

Your repo has both:
- 📱 Frontend (React Native/Expo) - in root folder
- 🐍 Backend (Python/FastAPI) - in `/backend` folder

Render was trying to deploy **everything** (including frontend), which caused the Node.js/TypeScript error.

**Solution:** Tell Render to only look at the `/backend` folder by setting **Root Directory = backend**

---

## ✅ Next Steps After Fix

Once deployment succeeds:

1. ✅ Test health endpoint
2. ✅ Verify environment variables are set
3. ✅ Update mobile app `.env`:
   ```
   EXPO_PUBLIC_BACKEND_URL=https://skapa-backend.onrender.com
   ```
4. ✅ Test the app on your phone!

---

**Try Option 1 first (update settings in dashboard). It's the fastest! 🚀**

Let me know if you need help with any step!
