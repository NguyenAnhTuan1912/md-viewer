module.exports = {
  apps: [
    {
      name: 'md-viewer',
      cwd: './backend',
      script: 'dist/apps/api/src/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 19121,
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 2000,
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      out_file: '../logs/out.log',
      error_file: '../logs/error.log',
      merge_logs: true,
      time: true,
    },
  ],
};
