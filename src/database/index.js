import Sequelize from 'sequelize';

// Configuração do banco de dados
import dbConfig from '../config/database';

// Models
const models = [];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models.map(model => model.init(this.connection));
  }
}

export default new Database();
