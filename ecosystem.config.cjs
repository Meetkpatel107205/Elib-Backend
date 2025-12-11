module.exports = {
  apps: [
    {
      name: "elib-backend-app",
      script: "./dist/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: process.env.PORT,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT,
      },
    },
  ],
};