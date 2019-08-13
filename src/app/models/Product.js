import Sequelize, { Model } from 'sequelize';

class Product extends Model {
  static init(sequelize) {
    super.init({
      brand_id: Sequelize.INTEGER,
      description: Sequelize.STRING,
      unit: Sequelize.STRING,
      ncm: Sequelize.INTEGER,
    }, {
      sequelize,
    })

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Brand, { foreignKey: 'brand_id', as: 'brand' })
  }
}

export default Product;
