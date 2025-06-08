# Running Medplum App with PM2

This guide explains how to run the Medplum app using PM2 for process management.

## Prerequisites

- Node.js 20+
- PM2 installed (included as a dev dependency)

## Environment Variables

The app uses the following environment variables (configured in `.env.defaults`):

- `MEDPLUM_BASE_URL`: Base URL for the Medplum server (default: http://localhost:8103)
- `MEDPLUM_CLIENT_ID`: Client ID for authentication
- `RECAPTCHA_SITE_KEY`: Site key for reCAPTCHA
- `GOOGLE_CLIENT_ID`: Google OAuth client ID

## Available Scripts

- `npm run pm2:dev` - Start the app in development mode with PM2
- `npm run pm2:prod` - Start the app in production mode with PM2
- `npm run pm2:stop` - Stop all PM2 processes
- `npm run pm2:restart` - Restart all PM2 processes
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:monit` - Open PM2 monitoring dashboard

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the app in development mode:**

   ```bash
   npm run pm2:dev
   ```

3. **View logs:**

   ```bash
   npm run pm2:logs
   ```

4. **Monitor the process:**

   ```bash
   npm run pm2:monit
   ```

5. **Stop the app:**
   ```bash
   npm run pm2:stop
   ```

## Configuration

The PM2 configuration is defined in `ecosystem.config.js`. You can modify:

- Port (default: 3010)
- Environment variables
- Memory limits
- Log file locations
- Number of instances

## Log Files

PM2 logs are stored in the `./logs/` directory:

- `err.log` - Error logs
- `out.log` - Standard output logs
- `combined.log` - Combined logs

## Production Deployment

For production, set the environment variables and run:

```bash
npm run pm2:prod
```

The app will be available at `http://localhost:3010` by default.
