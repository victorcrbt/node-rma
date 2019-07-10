import Odbc from '../../lib/Odbc';

import Product from '../models/Product';
import Brand from '../models/Brand';

import SyncBrandController from './SyncBrandController';

class SyncProductController {
  async sync(req, res) {
    const saveProductsToDatabase = async products => {
      console.log('func 4');

      if (products) {

        try {
          await products.map(async ({ id, brand_id, description, unit, ncm }) => {
            try {
              const product = await Product.findByPk(id);

              console.log(product);

              // if (product && product.description !== description) {
              //   try {
              //     await product.update({
              //       description,
              //     });
              //   } catch (err) {
              //     console.log(err);
              //   }
              // } else if (!product) {
              //   try {
              //     Product.create({
              //       id,
              //       brand_id,
              //       description,
              //       unit,
              //       ncm
              //     });
              //   } catch (err) {
              //     console.log(err);
              //   }

              // }
            } catch (err) {
              console.log(err);
            }
          });
        } catch (err) {
          console.log(err);
        }
      }

    };

    const getProductsFromErp = async () => {
      try {
        const products = await Odbc.query(
          'SELECT * FROM "02568s000"."PRODUTOS_GARANTIA"'
        );

        if (products) {
          return console.log(products);
        }
      } catch (err) {
        return console.log(err);
      }
    };

    const saveBrandsToDatabase = async brands => {
      console.log('func 2');

      if (brands) {

        try {
          await brands.map(async ({ id, description }) => {
            try {
              const brand = await Brand.findByPk(id);

              if (brand && brand.description !== description) {
                try {
                  await brand.update({
                    description,
                  });
                } catch (err) {
                  console.log(err);
                }
              } else if (!brand) {
                try {
                  Brand.create({
                    id,
                    description,
                  });
                } catch (err) {
                  console.log(err);
                }

              }
            } catch (err) {
              console.log(err);
            }
          });

          return getProductsFromErp();
        } catch (err) {
          console.log(err);
        }
      }

    };

    const getBrandsFromErp = async () => {
      try {
        const brands = await Odbc.query(
          'SELECT * FROM "02568s000"."MARCAS_GARANTIA"'
        );

        if (brands) {
          return saveBrandsToDatabase(brands);
        }
      } catch (err) {
        return console.log(err);
      }
    };



    getBrandsFromErp();
    // saveBrandsToDatabase();
    // getProductsFromErp();

    // const resyncBrands = async () => {

    //   if (response) {
    //     response.map(async ({ id, description }) => {
    //       const brand = await Brand.findByPk(id);

    //       if (brand && brand.description !== description) {
    //         await brand.update({
    //           description,
    //         });
    //       } else if (!brand) {
    //         await Brand.create({
    //           id,
    //           description,
    //         });
    //       }
    //     });
    //   }
    // };

    // const syncToErp = async () => {
    //   const products = await Odbc.query(
    //     'SELECT * FROM "02568s000"."PRODUTOS_GARANTIA"'
    //   );

    //   if (products) {
    //     products.map(async ({ id, brand_id, description, unit, ncm }) => {
    //       const product = await Product.findByPk(id);

    //       if (product && product.description !== description) {
    //         await product.update({
    //           description,
    //         });
    //       } else if (!product) {
    //         await Product.create({
    //           id,
    //           brand_id: brand_id === 0 ? 98 : brand_id,
    //           description,
    //           unit,
    //           ncm,
    //         });
    //       }
    //     });
    //   }
    // };

    return res.status(201).json();
  }
}

export default new SyncProductController();
