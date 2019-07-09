import Odbc from '../../lib/Odbc';

import Product from '../models/Product';
import Brand from '../models/Brand';

import SyncBrandController from './SyncBrandController';

class SyncProductController {
  async sync(req, res) {
    await SyncBrandController.resync();

    const response = await Odbc.query('SELECT * FROM "02568s000"."PRODUTOS_GARANTIA"');

    await response.map(async ({ id, brand_id, description, unit, ncm }) => {
      const product = await Product.findByPk(id);

      if (product && (product.description !== description)) {
        await product.update({
          description
        })
      } else if (!product) {
        await Product.create({
          id,
          brand_id: brand_id === 0 ? 98 : brand_id,
          description,
          unit,
          ncm,
        });
      }
    })

    return res.status(201).json();
  }
}

export default new SyncProductController();
