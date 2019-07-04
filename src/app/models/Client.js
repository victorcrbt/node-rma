import Sequelize, { Model } from 'sequelize';

class Client extends Model {
  static init(sequelize) {
    super.init({
      salesman_id: Sequelize.INTEGER,
      company_name: Sequelize.STRING,
      address: Sequelize.STRING,
      address_number: Sequelize.STRING,
      neighborhood: Sequelize.STRING,
      zip_code: Sequelize.STRING,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      area_code: Sequelize.INTEGER,
      phone_number: Sequelize.INTEGER,
      email: Sequelize.STRING,
    }, {
      sequelize,
    })

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Salesman, { foreignKey: 'salesman_id', as: 'salesman' })
  }
}

export default Client;
