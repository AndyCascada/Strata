module.exports = {
  apps: [
    {
      name: "strata",
      // `next` is hoisted to the workspace root node_modules by npm, not the
      // app's local node_modules, so point PM2 at the hoisted binary.
      script: "/opt/strata/node_modules/.bin/next",
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
