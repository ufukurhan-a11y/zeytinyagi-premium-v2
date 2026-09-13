// ============================================================
// Zeytinyağı Premium — PM2 Process Yönetimi
# Kullanım (sunucuda):
#   pm2 start deploy/ecosystem.config.cjs
#   pm2 save && pm2 startup
# ============================================================
module.exports = {
  apps: [
    {
      name: "zeytinyagi-premium",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/opt/zeytinyagi-premium",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        NEXT_TELEMETRY_DISABLED: 1,
        NEXT_NO_UPDATE_CHECK: 1,
      },
      out_file: "/opt/zeytinyagi-premium/logs/out.log",
      error_file: "/opt/zeytinyagi-premium/logs/err.log",
      merge_logs: true,
      max_memory_restart: "1G",
    },
  ],
};
