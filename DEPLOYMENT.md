# 🚀 Deploying PeerLearn

Your app has three parts that each need a home online:

| Part | Service (free tier) | What it hosts |
| ---- | ------------------- | ------------- |
| Database | **MongoDB Atlas** | Your data |
| Backend (`server/`) | **Render** | The Express API |
| Frontend (`client/`) | **Vercel** | The React website |

Do the steps **in this order**. Total time: ~30–45 minutes.

---

## Step 0 — Put your code on GitHub ✅ (DONE)

Both Render and Vercel deploy from a GitHub repository.

Your code is already pushed to:
**https://github.com/telishlok510-prog/peerlearn**

For future code changes, just run:
```
git add .
git commit -m "describe your change"
git push
```
Render and Vercel will automatically redeploy.

---

## Step 1 — Database: MongoDB Atlas

1. Sign up at https://www.mongodb.com/cloud/atlas/register
2. Create a **free M0 cluster** (pick any cloud/region).
3. **Database Access** → Add a database user (note the username + password).
4. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`).
5. **Clusters → Connect → Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Insert your password and add the database name `peerlearn` before the `?`:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/peerlearn?retryWrites=true&w=majority
   ```
   Save this — it's your production `MONGO_URI`.

---

## Step 2 — Backend: Render

1. Sign up at https://render.com (log in with GitHub).
2. **New → Web Service** → connect your `peerlearn` repo.
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables** (Advanced → Add Environment Variable):
   | Key | Value |
   | --- | ----- |
   | `MONGO_URI` | (your Atlas string from Step 1) |
   | `JWT_SECRET` | a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | (leave blank for now; fill in after Step 3) |
5. Click **Create Web Service**. When it finishes, copy the URL, e.g.
   `https://peerlearn-api.onrender.com`
6. Test it: open `https://peerlearn-api.onrender.com/api/health` — you should see the OK message.
7. Create your admin account on the live DB: in Render, open the service **Shell** tab and run:
   ```
   npm run seed:admin
   ```

---

## Step 3 — Frontend: Vercel

1. Sign up at https://vercel.com (log in with GitHub).
2. **Add New → Project** → import your `peerlearn` repo.
3. Configure:
   - **Root Directory:** `client`
   - Framework preset: **Vite** (auto-detected)
4. Add an **Environment Variable**:
   | Key | Value |
   | --- | ----- |
   | `VITE_API_URL` | `https://peerlearn-api.onrender.com/api` (your Render URL + `/api`) |
5. Click **Deploy**. You'll get a URL like `https://peerlearn.vercel.app`.

---

## Step 4 — Connect the two

1. Back in **Render**, set the `CLIENT_URL` env var to your Vercel URL
   (e.g. `https://peerlearn.vercel.app`) and let it redeploy.
2. Open your Vercel URL — your site is live! 🎉

---

## Notes

- **Render free tier sleeps** after inactivity, so the first request after a while
  takes ~30 seconds to wake up. That's normal on the free plan.
- After any code change, just `git push` — Render and Vercel redeploy automatically.
- Default admin login (created by the seed): `admin@college.edu` / `admin12345`
  — change the password after first login.

---

## Pre-launch checklist

- [ ] `JWT_SECRET` changed to a long random value in production (not the dev value).
- [ ] Admin password changed from the default after first login.
- [ ] `CLIENT_URL` set on the backend (Render) so CORS is restricted to your frontend.
- [ ] `VITE_API_URL` on the frontend (Vercel) points at the backend and ends with `/api`.
- [ ] Atlas Network Access allows `0.0.0.0/0` (or Render's IP).
- [ ] Real `.env` files are NOT committed to git (only `.env.example` is).
