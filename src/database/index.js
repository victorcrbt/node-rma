import Sequelize from 'sequelize';

// Importação dos models
import User from '../app/models/User';

// Configuração do banco de dados
import dbConfig from '../config/database';

// Models
const models = [User];

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
