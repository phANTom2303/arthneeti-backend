module.exports = {
  apps: [
    {
      name: 'rest-api-server',
      script: './rest-api-server/app.js',
      ignore_watch: ['node_modules'],
      env_development: {
        PORT: 3001,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 3001,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'live-tick-server',
      script: './live-tick-server/app.js',
      ignore_watch: ['node_modules'],
      env_development: {
        PORT: 3002,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: 3002,
        NODE_ENV: 'production'
      }
    }
  ]
};
