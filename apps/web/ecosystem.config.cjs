module.exports = {
  apps: [
    {
      name: "strata",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/opt/strata/apps/web",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
