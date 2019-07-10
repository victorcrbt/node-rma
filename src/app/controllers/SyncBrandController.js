import Odbc from '../../lib/Odbc';

import Brand from '../models/Brand';

class SyncProductController {
  async sync(req, res) {
    const response = await Odbc.query(
      'SELECT * FROM "02568s000"."MARCAS_GARANTIA"'
    );

    response.map(async ({ id, description }) => {
      const brand = await Brand.findByPk(id);

      if (brand && brand.description !== description) {
        await brand.update({
          description,
        });
      } else if (!brand) {
        await Brand.create({
          id,
          description,
        });
      }
    });

    return res.status(201).json();
  }

  async resync(req, res) {
    const response = await Odbc.query(
      'SELECT * FROM "02568s000"."MARCAS_GARANTIA"'
    );

    response.map(async ({ id, description }) => {
      const brand = await Brand.findByPk(id);

      if (brand && brand.description !== description) {
        await brand.update({
          description,
        });
      } else if (!brand) {
        await Brand.create({
          id,
          description,
        });
      }
    });
  }
}

export default new SyncProductController();
