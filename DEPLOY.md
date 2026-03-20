# Deploy to Render

## Backend Deployment (Render)

### Option 1: Deploy via Render Dashboard

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** `crop-disease-api`
   - **Region:** Oregon (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables:
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
   - `JWT_SECRET` = Generate a secure random string
   - `PORT` = `10000`
   - `FRONTEND_URL` = your Vercel frontend URL (after deploying)

6. Click **"Create Web Service"**

### Option 2: Deploy via render.yaml (Continuous Deployment)

1. Push the `render.yaml` file to your repository
2. Connect your GitHub repo to Render
3. Render will automatically detect the `render.yaml` and deploy

## Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `client`
4. Add environment variable:
   - `VITE_API_URL` = your Render backend URL (e.g., `https://crop-disease-api.onrender.com/api`)
5. Deploy

## After Deployment

1. Update frontend `VITE_API_URL` with Render URL
2. Update backend `FRONTEND_URL` with Vercel URL
3. Add CORS origins in Render dashboard if needed
