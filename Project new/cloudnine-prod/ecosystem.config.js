module.exports = {
  apps: [
    {
      name: 'cloudnine-server',
      script: './server/src/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      log_file: './logs/server.log',
      out_file: './logs/server-out.log',
      error_file: './logs/server-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '500M',
      restart_delay: 3000,
      max_restarts: 5,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      kill_timeout: 5000,
      listen_timeout: 10000,
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/cloudnine-insurance.git',
      path: '/var/www/cloudnine',
      'post-deploy': 'npm install && cd server && npm install && npx prisma migrate deploy && cd .. && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get update && apt-get install -y git nodejs npm',
    },
  },
};
