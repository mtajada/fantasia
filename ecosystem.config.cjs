module.exports = {
  apps: [
    {
      name: "cuenta-cuentos",
      script: "npm",
      args: "run start:prod",
      env: {
        NODE_ENV: "production",
        PORT: "8080"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
} 
