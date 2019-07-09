import odbc from 'odbc';
import odbcConfig from '../config/odbc';

class Odbc {
  async query(sql) {
    if (typeof sql !== 'string') {
      throw new Error('O parâmetro da função deve ser uma string SQL.');
    }

    try {
      const connection = await odbc.connect(odbcConfig);

      try {
        const response = await connection.query(sql);

        return response;
      } catch (err) {
        return console.log(err);
      }
    } catch (err) {
      return console.log(err);
    }
  }
}

export default new Odbc();
