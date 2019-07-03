import Sequelize from 'sequelize';

// Importação dos models
import User from '../app/models/User';
import File from '../app/models/File';
import Status from '../app/models/Status';

// Configuração do banco de dados
import dbConfig from '../config/database';

// Models
const models = [User, File, Status];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(dbConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
