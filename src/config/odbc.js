import 'dotenv/config';

export default {
  connectionString: process.env.ODBC_DSN,
  connectionTimeout: process.env.ODBC_CONN_TIMEOUT,
  loginTimeout: process.env.ODBC_LOGIN_TIMEOUT
}
