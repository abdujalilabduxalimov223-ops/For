const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'informatika_db',
  password: 'Jal1l2003.', // 🔴 pgAdmin’da kiradigan parol
  port: 5432,
});

module.exports = pool;
