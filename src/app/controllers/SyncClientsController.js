import Odbc from '../../lib/Odbc';

import Client from '../models/Client';
import Salesman from '../models/Salesman';
import User from '../models/User';

class SyncClientsController {
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

    const getClientsFromErp = () => {
      return Odbc.query('SELECT * FROM "02568s000"."CLIENTES_GARANTIA"');
    };

    const saveClientsToDatabase = clients => {
      return Promise.all(
        clients.map(async client => {
          const {
            id,
            salesman_id,
            company_name,
            address,
            address_number,
            neighborhood,
            zip_code,
            city,
            state,
            phone,
            email,
            document,
            subscription_type,
          } = client;

          let formattedDocument = String(document);
          let formattedZipCode = String(zip_code);
          const formattedPhone = String(phone);

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

          /**
           * Preenche os zeros a esquerda presentes em CEPs.
           */
          while (zip_code.length < 8) {
            formattedZipCode = `0${formattedZipCode}`;
          }

          const clientExists = await Client.findByPk(id);

          if (clientExists) {
            await clientExists.update({
              id,
              salesman_id,
              company_name: company_name.trim(),
              address: address.trim(),
              address_number,
              neighborhood: neighborhood.trim(),
              zip_code: formattedZipCode,
              city: city.trim(),
              state: state.trim(),
              phone: phone === 0 ? null : formattedPhone,
              email:
                email ===
                '                                                                              '
                  ? null
                  : email.trim(),
              document: formattedDocument,
              subscription_type,
            });
          } else if (!clientExists) {
            await Client.create({
              id,
              salesman_id,
              company_name: company_name.trim(),
              address: address.trim(),
              address_number,
              neighborhood: neighborhood.trim(),
              zip_code: formattedZipCode,
              city: city.trim(),
              state: state.trim(),
              phone: phone === 0 ? null : formattedPhone,
              email:
                email ===
                '                                                                              '
                  ? null
                  : email.trim(),
              document: formattedDocument,
              subscription_type,
            });
          }
        })
      );
    };

    const salesmen = await getSalesmenFromErp();
    await saveSalesmenToDatabase(salesmen);
    const clients = await getClientsFromErp();
    await saveClientsToDatabase(clients);

    return res.status(200).json();
  }
}

export default new SyncClientsController();
