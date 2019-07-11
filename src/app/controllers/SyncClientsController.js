import { cpf, cnpj } from 'cpf-cnpj-validator';

import Odbc from '../../lib/Odbc';

import Client from '../models/Client';

class SyncClientsController {
  async sync(req, res) {
    const getClientsFromErp = () => {
      return Odbc.query('SELECT * FROM "02568s000"."CLIENTES_GARANTIA"');
    }

    const saveClientsToDatabase = clients => {
      return Promise.all(clients.map(async client => {
        const { id, salesman_id, company_name, address, address_number, neighborhood, zip_code, city, state, phone, email, document, subscription_type } = client;

        let formattedDocument = String(document);
        let formattedZipCode = String(zip_code);
        let formattedPhone = String(phone);

        /**
         * Preenche os zeros a esquerda necessários em CPFs.
         */
        while (subscription_type === "F" && formattedDocument.length < 11) {
          formattedDocument = "0" + formattedDocument;
        }

        /**
         * Preenche os zeros a esquerda necessários em CNPJs.
         */
        while (subscription_type === "J" && formattedDocument.length < 14) {
          formattedDocument = "0" + formattedDocument;
        }

        /**
         * Preenche os zeros a esquerda presentes em CEPs.
         */
        while (zip_code.length < 8) {
          formattedZipCode = "0" + formattedZipCode;
        }

        const clientExists = await Client.findByPk(id);

        if (clientExists) {
          await clientExists.update({
            id,
            salesman_id,
            company_name,
            address,
            address_number,
            neighborhood,
            zip_code: formattedZipCode,
            city,
            state,
            phone: phone === 0 ? null : formattedPhone,
            email: email === "                                                                              "
                      ? null
                      : email,
            document: formattedDocument,
            subscription_type
          })
        } else if (!clientExists) {
          await Client.create({
            id,
            salesman_id,
            company_name,
            address,
            address_number,
            neighborhood,
            zip_code: formattedZipCode,
            city,
            state,
            phone: phone === 0 ? null : formattedPhone,
            email: email === "                                                                              "
                      ? null
                      : email,
            document: formattedDocument,
            subscription_type
          })
        }
      }))
    }

    const clients = await getClientsFromErp();
    await saveClientsToDatabase(clients);

    return res.status(200).json();
  }
}

export default new SyncClientsController();
