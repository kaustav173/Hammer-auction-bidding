# Deployment

## Docker Compose

1. Create the deployment environment file:

   ```bash
   cp .env.example .env
   ```

2. Replace both JWT placeholder values in `.env` with long random secrets. Add the production Razorpay values when payments are enabled.

3. Build and start the complete stack:

   ```bash
   docker compose up -d --build
   ```

The web app is available at `http://localhost:3000` and the API health check is at `http://localhost:5001/health`. Database migrations run automatically when the API container starts.

If port `3000` is already in use, set `WEB_PORT=3001` in `.env`. The API host port can be changed with `API_PORT`.

For a hosted deployment, set `FRONTEND_URL` to the public web URL and `NEXT_PUBLIC_API_URL` to the public API URL before building the web image. Keep `.env` out of version control.
