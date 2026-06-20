# Deploying PeerLearn

PeerLearn is a MERN app with three pieces to deploy:

1. **Database** – MongoDB (move from local to MongoDB Atlas)
2. **Backend** – the Express server in `/server`
3. **Frontend** – the React/Vite app in `/client`

---

## 1. Database — MongoDB Atlas

1. Create a free cluster at https://www.mongodb.com/atlas
2. Create a database user (username + password).
3. Under Network Access, allow your backend host's IP, or `0.0.0.0/0` to allow all.
4. Copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/peerlearn`

This is your production `MONGO_URI`.

---

## 2. Backend — e.g. Render / Railway / Fly.io

Using Render as an example:

1. New → **Web Service** → connect your Git repository.
2. **Root Directory:** `server`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. Add Environment Variables (see `server/.env.example`):
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string (do NOT reuse the dev value)
   - `JWT_EXPIRES_IN` = `7d`
   - `CLIENT_URL` = your frontend URL (set after step 3)
   - `PORT` is provided automatically by the host.
6. Deploy. You'll get a URL like `https://peerlearn-api.onrender.com`.

---

## 3. Frontend — e.g. Vercel / Netlify

1. Import your Git repo.
2. **Root Directory:** `client`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. Add Environment Variable (see `client/.env.example`):
   - `VITE_API_URL` = `https://peerlearn-api.onrender.com/api`
     (your backend URL from step 2, ending in `/api`)
6. Deploy. You'll get a URL like `https://peerlearn.vercel.app`.

---

## 4. Wire the two together

- Set the backend's `CLIENT_URL` to the frontend URL from step 3, then redeploy
  the backend so CORS allows it.
- Make sure the frontend's `VITE_API_URL` points at the backend (Vite bakes
  `VITE_*` vars in at build time — redeploy the frontend if you change it).

---

## 5. Seed the admin account

After the backend is connected to Atlas, create the admin once. Either run it
locally with the production `MONGO_URI`, or use your host's shell:

```
npm run seed:admin
```

Default credentials (change the password after first login):
- Email: `admin@college.edu`
- Password: `admin12345`

---

## Pre-launch checklist

- [ ] `JWT_SECRET` changed to a long random value in production.
- [ ] Admin password changed from the default.
- [ ] `CLIENT_URL` set on the backend so CORS is restricted to your frontend.
- [ ] Real `.env` files are NOT committed to git (only `.env.example` is).
- [ ] Atlas Network Access configured for your backend host.
