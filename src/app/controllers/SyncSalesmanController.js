import Odbc from '../../lib/Odbc';

import Salesman from '../models/Salesman';
import User from '../models/User';

class SyncSalesmanController {
  async sync(req, res) {
    const { admin: isAdmin, employee: isEmployee } = await User.findByPk(req.userId);

    if (!isAdmin && !isEmployee) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }
  
    const getSalesmenFromErp = () => {
      return Odbc.query('SELECT * FROM "02568s000"."RERPESENTANTES_GARANTIA"');
    };

    const saveSalesmenToDatabase = salesmen => {
      return Promise.all(
        salesmen.map(async ({ id, name, document, subscription_type }) => {
          let formattedDocument = String(document);

          /**
           * Preenche os zeros a esquerda necessários em CPFs.
           */
          while (subscription_type === 'F' && formattedDocument.length < 11) {
            formattedDocument = `0${formattedDocument}`;
          }

          /**
           * Preenche os zeros a esquerda necessários em CNPJs.
           */
          while (subscription_type === 'J' && formattedDocument.length < 14) {
            formattedDocument = `0${formattedDocument}`;
          }

          const salesman = await Salesman.findByPk(id);

          if (salesman) {
            await salesman.update({
              name: name.trim(),
              document: formattedDocument,
            });
          } else if (!salesman) {
            await Salesman.create({
              id,
              name: name.trim(),
              document: formattedDocument,
            });
          }
        })
      );
    };

    const salesmen = await getSalesmenFromErp();
    await saveSalesmenToDatabase(salesmen);

    return res.status(200).json();
  }
}

export default new SyncSalesmanController();
