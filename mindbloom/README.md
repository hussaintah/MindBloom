# 🌸 MindBloom — Complete Deployment Guide

A full-stack mental wellness app. Free forever with the services below.

---

## Architecture

```
Frontend (React)  →  Vercel (free)
Backend (Node.js) →  Render (free)
Database + Auth   →  Supabase (free)
AI Chatbot        →  Groq API (free)
Email Reminders   →  Resend (free, 3k/month)
```

---

## STEP 1: Supabase Setup (Database + Auth)

1. Go to **https://supabase.com** → Create account → New project
2. Note your **Project URL** and both keys (anon + service_role) from Settings → API
3. Go to **SQL Editor** → Run this SQL to create your tables:

```sql
-- Sleep logs
CREATE TABLE sleep_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  hours DECIMAL(3,1) NOT NULL,
  quality INTEGER CHECK (quality BETWEEN 1 AND 5),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Mood logs
CREATE TABLE mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 1 AND 5) NOT NULL,
  emotion TEXT,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Email notification preferences
CREATE TABLE notification_prefs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  sleep_reminder BOOLEAN DEFAULT TRUE,
  morning_checkin BOOLEAN DEFAULT TRUE,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (important!)
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own sleep" ON sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own mood" ON mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own prefs" ON notification_prefs FOR ALL USING (auth.uid() = user_id);
```

4. In Supabase → Authentication → Settings:
   - Enable "Email" provider
   - If testing without email confirm, disable "Enable email confirmations" temporarily

---

## STEP 2: Get Free API Keys

### Groq (AI Chat)
1. Go to **https://console.groq.com** → Sign up free
2. API Keys → Create API Key → Copy it

### Resend (Emails)
1. Go to **https://resend.com** → Sign up free
2. API Keys → Create key → Copy it
3. (Optional) Add your domain for custom sender email — or use `onboarding@resend.dev` for testing

---

## STEP 3: Deploy Backend to Render

1. Push your code to **GitHub** (create a repo, upload the `mindbloom` folder)
2. Go to **https://render.com** → New → Web Service
3. Connect your GitHub repo → Select the `backend` folder
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
5. Add Environment Variables:
   ```
   SUPABASE_URL = https://your-project.supabase.co
   SUPABASE_SERVICE_KEY = your-service-role-key
   GROQ_API_KEY = your-groq-key
   RESEND_API_KEY = your-resend-key
   FROM_EMAIL = MindBloom <onboarding@resend.dev>
   FRONTEND_URL = https://your-app.vercel.app (add after step 4)
   ```
6. Click **Deploy** — Render gives you a URL like `https://mindbloom-backend.onrender.com`

> ⚠️ Free Render instances "sleep" after 15 min of inactivity. Consider using UptimeRobot (free) to ping `/health` every 5 minutes to keep it awake.

---

## STEP 4: Deploy Frontend to Vercel

1. Go to **https://vercel.com** → New Project → Import your GitHub repo
2. Select the `frontend` folder as the root directory
3. Add Environment Variables:
   ```
   REACT_APP_SUPABASE_URL = https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = your-anon-key
   REACT_APP_API_URL = https://mindbloom-backend.onrender.com
   ```
4. Click **Deploy** — Vercel gives you a URL like `https://mindbloom.vercel.app`
5. Go back to Render → Update `FRONTEND_URL` env var with your Vercel URL

---

## STEP 5: Final Checks

- [ ] Visit your Vercel URL
- [ ] Sign up for a new account
- [ ] Log some sleep and mood data
- [ ] Open Chat and talk to Bloom
- [ ] Go to Settings → enter email → Save → Test email buttons
- [ ] Try the breathing exercises

---

## Features Summary

| Feature | Description |
|---------|-------------|
| 🔐 Auth | Email/password sign up & login via Supabase |
| 😴 Sleep Tracker | Log hours + quality, see 7-day bar chart with ideal range |
| 🌈 Mood Tracker | 5-point scale + emotion tags + 7-day trend line |
| 💬 AI Chatbot | Streaming chat with Bloom (Groq llama3-8b) |
| 🍃 Breathing | Box, 4-7-8, and Calming breath exercises |
| 📬 Email Reminders | Nightly sleep + morning check-in via Resend |
| 📊 Dashboard | 7-day combined chart + wellness tips |
| 📱 Responsive | Works on mobile + desktop |

---

## Running Locally

```bash
# Backend
cd backend
cp .env.example .env   # Fill in your keys
npm install
npm run dev            # Starts on port 3001

# Frontend (new terminal)
cd frontend
cp .env.example .env   # Fill in your keys
npm install
npm start              # Starts on port 3000
```

---

## Scaling Notes

All free tiers are generous for a class project:
- **Supabase**: 500MB database, unlimited auth users
- **Render**: 750 hours/month (enough for 1 service running all month)
- **Vercel**: Unlimited deployments, 100GB bandwidth
- **Groq**: ~14,400 free requests/day
- **Resend**: 3,000 emails/month free

For a happiness class project, this will easily handle hundreds of users for free. 🎉
