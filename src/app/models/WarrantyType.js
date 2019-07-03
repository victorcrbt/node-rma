import Sequelize, { Model } from 'sequelize';

class WarrantyType extends Model {
  static init(sequelize) {
    super.init({
      description: Sequelize.STRING,
    }, {
      sequelize,
      tableName: 'warranty_types'
    })

    return this;
  }
}

export default WarrantyType;
