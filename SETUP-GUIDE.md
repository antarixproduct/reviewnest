# ReviewNest Setup Guide

This guide is for buyers deploying ReviewNest for one business.

## What You Need

- GitHub account
- Render account
- MongoDB Atlas account
- Gmail account with an app password, only if email automation is needed

## 1. Upload Code To GitHub

Create a new private GitHub repository and upload this package.

Do not upload real `.env` files, Gmail app passwords, or MongoDB passwords to GitHub.

## 2. Create MongoDB Atlas Free Cluster

1. Create a MongoDB Atlas account.
2. Create a free shared cluster.
3. Create a database user.
4. Add network access for Render. For simple setup, use `0.0.0.0/0`.
5. Copy the connection string.
6. Replace `<password>` in the connection string with your database user's password.

Use this value as `MONGODB_URI`.

## 3. Deploy Backend On Render

Create a new Render Web Service:

- Root directory: `server`
- Build command: `npm install`
- Start command: `npm start`

Environment variables:

```env
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=
CLIENT_URL=
PORT=5000
```

Use long random values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

After deployment, open:

```txt
https://your-backend-url.onrender.com/health
```

You should see:

```json
{ "status": "ReviewNest API is running" }
```

## 4. Deploy Frontend On Render

Create a new Render Static Site:

- Root directory: leave blank if the repository root contains this package
- Build command: `cd dashboard && npm install && npm run build`
- Publish directory: `dashboard/dist`

Environment variable:

```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 5. Connect Frontend And Backend

In the backend Render service, set:

```env
FRONTEND_URL=https://your-frontend-url.onrender.com
CLIENT_URL=https://your-frontend-url.onrender.com
```

Redeploy the backend after changing these values.

## 6. Complete First Setup

Open the frontend URL. The app will show the one-time setup screen.

Enter:

- Business name
- Owner name
- Business type
- WhatsApp number
- Google review link
- Owner email
- Password

After setup is complete, `/register` is locked and future visits show only sign in.

## 7. Gmail SMTP Email Automation

Email automation is optional.

In Gmail:

1. Enable 2-Step Verification.
2. Create an App Password.
3. Copy the app password.

In ReviewNest Settings:

1. Enable email automation.
2. Enter Gmail address.
3. Enter Gmail app password.
4. Click Test Email.
5. Save settings.

Important: some free hosting plans restrict outbound SMTP traffic. If Test Email fails on a free backend host, use a paid backend plan or another email delivery method.

## 8. Custom Domain

In Render, add your custom domain to the frontend service. After DNS is verified, update backend `FRONTEND_URL` and `CLIENT_URL` to the custom domain.

## 9. PWA Installation

ReviewNest is PWA-compatible. After deployment, users can install it from supported browsers using the browser's install app option.
