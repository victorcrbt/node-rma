import Sequelize, { Model } from 'sequelize';

class Register extends Model {
  static init(sequelize) {
    super.init(
      {
        user_id: Sequelize.INTEGER,
        client_id: Sequelize.INTEGER,
        warranty_type_id: Sequelize.INTEGER,
        status_id: Sequelize.INTEGER,
        product_id: Sequelize.INTEGER,
        entry_invoice: Sequelize.INTEGER,
        entry_date: Sequelize.DATE,
        delivery_cost: Sequelize.FLOAT,
        repair_cost: Sequelize.FLOAT,
        exchange_value: Sequelize.FLOAT,
        exchange_mail: Sequelize.BOOLEAN,
        last_status_date: Sequelize.DATE,
        register_observations: Sequelize.TEXT,
        serial_number: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
    this.belongsTo(models.WarrantyType, {
      foreignKey: 'warranty_type_id',
      as: 'warranty_type',
    });
    this.belongsTo(models.Status, { foreignKey: 'status_id', as: 'status' });
    this.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  }
}

export default Register;
