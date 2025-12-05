module.exports = {
  apps: [
    {
      name: "afyadiet",
      script: "npm",
      args: "start",
      cwd: "/var/www/html/afyadiet",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
