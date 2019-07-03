import Sequelize, { Model } from 'sequelize';

class Employee extends Model {
  static init(sequelize) {
    super.init({
      name: Sequelize.STRING,
      document: Sequelize.STRING,
    }, {
      sequelize,
    });

    return this;
  }
}

export default Employee;
