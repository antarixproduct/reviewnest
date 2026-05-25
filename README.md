# ReviewNest

ReviewNest is a self-hosted, single-business review request dashboard. One buyer hosts one instance for one business.

## Recommended Database

Use MongoDB Atlas with `MONGODB_URI`. The codebase uses Mongoose models, so MongoDB Atlas is the simplest and lowest-risk database choice.

MongoDB Atlas free tier is enough for most small businesses starting out with ReviewNest. Upgrade only if storage, traffic, or performance limits are reached.

## Local Setup

1. Install dependencies:

```bash
cd server
npm install
cd ../dashboard
npm install
```

2. Create `server/.env`:

```env
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173
PORT=5000
```

3. Run the backend:

```bash
cd server
npm run dev
```

4. Run the frontend:

```bash
cd dashboard
npm run dev
```

5. Open `http://localhost:5173` and complete the one-time setup screen.

## Optional Gmail SMTP

Email automation can be configured from Settings. Gmail requires an app password, not the normal Gmail password.

Optional environment defaults:

```env
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=
EMAIL_SMTP_PASS=
EMAIL_FROM_ADDRESS=
```

The app always uses Gmail SMTP host `smtp.gmail.com` and port `587`.

## Render Deployment

Deploy two Render services:

1. `reviewnest-backend` as a Node web service from `server`
2. `reviewnest-frontend` as a static site from `dashboard`

Set backend environment variables:

```env
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=
CLIENT_URL=
```

Set frontend environment variables:

```env
VITE_API_URL=
```

Important: Render free web services may restrict outbound SMTP ports. If Gmail SMTP test emails fail on the free backend service, use a paid backend instance or an email provider/API that Render allows from your plan.

## Buyer Flow

1. Fork or upload the code to GitHub.
2. Create a MongoDB Atlas free cluster and copy the connection string.
3. Create a Render account.
4. Deploy the backend and set environment variables.
5. Deploy the frontend and set `VITE_API_URL`.
6. Open the frontend URL and complete one-time setup.
7. Optional: enable Gmail SMTP email automation in Settings.
8. Optional: connect a custom domain in Render.
