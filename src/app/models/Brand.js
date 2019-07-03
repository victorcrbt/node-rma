import Sequelize, { Model } from 'sequelize';

class Brand extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      description: Sequelize.STRING,
    }, {
      sequelize,
    })

    return this;
  }
}

export default Brand;
