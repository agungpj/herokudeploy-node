const { Pool } = require("pg");

const dbPool = new Pool({
  database: "dumbways",
  port: 5432,
  user: "postgres",
  password: "password",
});

module.exports = dbPool;
