const env = process.env;
const config = {
  database: {
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER || 'root',
    password: env.DB_PASSWORD || 'password',
    database: env.DB_NAME || 'Account',
    port: 3306
  }
};
  
module.exports = config;
