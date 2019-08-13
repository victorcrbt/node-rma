import Odbc from '../../lib/Odbc';

import Brand from '../models/Brand';
import User from '../models/User';

class SyncProductController {
  async sync(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(req.userId);

    if (!isAdmin && !isEmployee) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Pegar as marcas do ERP.
     */
    const getBrandsFromErp = () => {
      return Odbc.query('SELECT * FROM "02568s000"."MARCAS_GARANTIA"');
    };

    /**
     * Percorer a lista de marcas pegas do ERP.
     * Verificar se existe no banco de dados. Se sim, atualizar, caso contrário, salvar.
     */
    const saveBrandsToDatabase = async brands => {
      return Promise.all(
        brands.map(async ({ id, description }) => {
          const brand = await Brand.findByPk(id);

          if (brand && brand.description !== description) {
            await brand.update({
              description: description.trim(),
            });
          } else if (!brand) {
            await Brand.create({
              id,
              description: description.trim(),
            });
          }
        })
      );
    };

    const brands = await getBrandsFromErp();
    await saveBrandsToDatabase(brands);

    return res.status(201).json();
  }
}

export default new SyncProductController();
