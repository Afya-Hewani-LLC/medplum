module.exports = {
  apps: [
    {
      name: 'medplum-app',
      script: 'npx',
      args: 'vite --host 0.0.0.0 --port 3010',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        MEDPLUM_BASE_URL: process.env.MEDPLUM_BASE_URL || 'http://localhost:8103',
        MEDPLUM_CLIENT_ID: process.env.MEDPLUM_CLIENT_ID || '',
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      },
      env_production: {
        NODE_ENV: 'production',
        MEDPLUM_BASE_URL: process.env.MEDPLUM_BASE_URL || 'http://localhost:8103',
        MEDPLUM_CLIENT_ID: process.env.MEDPLUM_CLIENT_ID || '',
        RECAPTCHA_SITE_KEY: process.env.RECAPTCHA_SITE_KEY || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
    },
  ],
};
