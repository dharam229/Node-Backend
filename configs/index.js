const config = {
  dbUrl: process.env.DBURL || "mongodb://localhost:27017/mango_db",
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV || "development",
  API_V: process.env.API_V || "v1",
  UPLOAD_BASE: process.env.UPLOAD_BASE || "./uploads",
  logDir: process.env.LOGDIR || "logs",
};

module.exports = config;