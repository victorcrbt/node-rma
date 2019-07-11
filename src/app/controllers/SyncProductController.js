import Odbc from '../../lib/Odbc';

import Product from '../models/Product';
import Brand from '../models/Brand';

class SyncProductController {
  async sync(req, res) {
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
              description,
            });
          } else if (!brand) {
            await Brand.create({
              id,
              description,
            });
          }
        })
      );
    };

    /**
     * Pegar os produtos do ERP.
     */
    const getProductsFromErp = () => {
      return Odbc.query('SELECT * FROM "02568s000"."PRODUTOS_GARANTIA"');
    };

    /**
     * Percorer a lista de produtos pegas do ERP.
     * Verificar se existe no banco de dados. Se sim, atualizar, caso contrário, salvar.
     */
    const saveProductsToDatabase = async products => {
      return Promise.all(
        products.map(async ({ id, brand_id, description, unit, ncm }) => {
          const product = await Product.findByPk(id);

          if (product && product.description !== description) {
            await product.update({
              description,
            });
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
      );
    };

    /**
     * As funções precisam ser executadas nesta ordem e a próxima só pode executar quando a anteriro tiver terminado.
     */
    const brands = await getBrandsFromErp(); // Pega as marcas do ERP.
    await saveBrandsToDatabase(brands); // Passa as marcas para serem percorridas e salvas no banco de dados.
    const products = await getProductsFromErp(); // Pega as marcas do ERP.
    await saveProductsToDatabase(products); // Passa as marcas para serem percorridas e salvas no banco de dados.

    /**
     * A resposta só pode ocorrer quando todos as funções tiverem terminado.
     */
    return res.status(201).json();
  }
}

export default new SyncProductController();
