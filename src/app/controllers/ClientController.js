import { Op } from 'sequelize';
import * as yup from 'yup';

import Client from '../models/Client';
import User from '../models/User';
import Salesman from '../models/Salesman';

class ClientController {
  async index(req, res) {
    const where = {};
    const numberRegex = /^[0-9]*$/; // Testa se o parâmetro enviado contém somente números.

    const {
      client,
      id,
      company_name,
      document,
      address,
      address_number,
      neighborhood,
      city,
      zip_code,
      state,
      salesman_id,
    } = req.query;

    if (client) {
      where[Op.or] = [
        {
          /**
           * Verifica se o valor enviado contém somente números. Se sim, transforma a string em número e faz a busca,
           * caso contrário, deixa o campo nulo.
           */
          id: numberRegex.test(client) ? Number(client) : null,
        },
        {
          company_name: { [Op.iLike]: `%${client}%` },
        },
      ];
    }

    /**
     * Verifica se o ID do cliente foi enviado
     */
    if (id) {
      where.id = id;
    }

    /**
     * Verifica se a razão social foi enviada
     */
    if (company_name) {
      where.company_name = { [Op.iLike]: `%${company_name}%` };
    }

    /**
     * Verifica se o documento foi enviado
     */
    if (document) {
      where.document = { [Op.iLike]: `%${document}%` };
    }

    /**
     * Verifica se o endereço foi enviado
     */
    if (address) {
      where.address = { [Op.iLike]: `%${address}%` };
    }

    /**
     * Verifica se o número do endereço foi enviado
     */
    if (address_number) {
      where.address_number = address_number;
    }

    /**
     * Verifica se o bairro foi enviado
     */
    if (neighborhood) {
      where.neighborhood = { [Op.iLike]: `%${neighborhood}%` };
    }

    /**
     * Verifica se a cidade foi enviada
     */
    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    /**
     * Verifica se o CEP foi enviado
     */
    if (zip_code) {
      where.zip_code = { [Op.iLike]: `%${zip_code}%` };
    }

    /**
     * Verifica se o estado foi enviado
     */
    if (state) {
      where.state = { [Op.iLike]: `${state}` };
    }

    /**
     * Verifica se o representante foi enviado
     */
    if (salesman_id) {
      where.salesman_id = salesman_id;
    }

    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee, salesman, client: isClient } = await User.findByPk(
      req.userId
    );

    /**
     * Verifica se todos os tipos estão falsos.
     */
    if (!isClient && !admin && !employee && !salesman) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for cliente, não permite a visualização de outros clientes.
     */
    if (isClient) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for vendedor, lista apenas os seus clientes.
     */
    if (salesman) {
      where.salesman_id = req.refId;

      const clients = await Client.findAll({
        where,
      });

      return res.status(200).json(clients);
    }

    /**
     * Se o usuário for administrador e/ou funcionário comum, retorna todos os clientes.
     */
    const clients = await Client.findAll({
      where,
    });

    return res.status(200).json(clients);
  }

  async show(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const {
      admin,
      employee,
      salesman,
      client,
      reference_id,
    } = await User.findByPk(req.userId);

    /**
     * Verifica se todos os tipos estão falsos.
     */
    if (!client && !admin && !employee && !salesman) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for cliente, não permite a visualização de outros clientes.
     */
    if (client) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const cli = await Client.findByPk(req.params.id);

    /**
     * Verifica se o usuário é um vendedor e se o cliente pertence a ele.
     */
    if (salesman && reference_id !== cli.salesman_id) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Verifica se o cliente existe.
     */
    if (!cli) {
      return res.status(404).json({
        error: 'Não foi encontrado um cliente com o ID especificado.',
      });
    }

    /**
     * Se o usuário for administrador e/ou funcionário comum, retorna todos os clientes.
     */
    return res.status(200).json(cli);
  }

  async store(req, res) {
    const validationSchema = yup.object().shape({
      id: yup
        .number()
        .max(Number.MAX_SAFE_INTEGER, 'O número digitado não é válido.')
        .required('O código é obrigatório.'),
      company_name: yup.string().required('A razão social é obrigatória.'),
      document: yup.string().required('O documento é obrigatório.'),
      address: yup.string().required('O endereço é obrigatório.'),
      address_number: yup
        .string()
        .required('O número do endereço é obrigatório.'),
      neighborhood: yup.string().required('O bairro é obrigatório.'),
      zip_code: yup.string().required('O CEP é obrigatório.'),
      city: yup.string().required('A cidade é obrigatória.'),
      state: yup.string().required('A UF é obrigatória.'),
      email: yup.string().email('O formato de e-mail não é válido.'),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      return res.status(400).json({ error: errors });
    }

    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Verifica se o ID já foi utilizado.
     */
    const usedId = await Client.findByPk(req.body.id);

    if (usedId) {
      return res.status(400).json({ error: 'O ID já está em uso.' });
    }

    /**
     * Verifica se o documento já foi utilizado.
     */
    const usedDocument = await Client.findOne({
      where: {
        document: req.body.document,
      },
    });

    if (usedDocument) {
      return res.status(400).json({
        error: `O documento já está em uso pelo cliente ${usedDocument.id}.`,
      });
    }

    /**
     * Verifica se o representante está cadastrado.
     */
    const salesmanExists = await Salesman.findByPk(req.body.salesman_id);

    if (req.body.salesman_id && !salesmanExists) {
      return res
        .status(404)
        .json({ error: 'O representante informado não está cadastrado.' });
    }

    const client = await Client.create(req.body);

    return res.status(201).json(client);
  }

  async update(req, res) {
    const validationSchema = yup.object().shape({
      company_name: yup.string(),
      document: yup.string(),
      address: yup.string(),
      address_number: yup.string(),
      neighborhood: yup.string(),
      zip_code: yup.string(),
      city: yup.string(),
      state: yup.string(),
      email: yup.string().email('O formato de e-mail não é válido.'),
    });

    try {
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      err.inner.map(error => {
        const infos = {
          field: error.path,
          error: error.message,
        };

        errors.push(infos);
      });

      return res.status(400).json({ error: errors });
    }

    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Exclui o ID dos campos a serem atualizados.
     */
    let updateFields = {};

    // Pega as chaves do objeto. A função retorna um array comente com as chaves do objeto.
    Object.keys(req.body).map(key => {
      // Verifica se o nome da chave não é 'id'.
      if (key !== 'id') {
        // Insere no objeto a chave atual, e o valor do objeto req.body referente a esta chave.
        return (updateFields = { ...updateFields, [key]: req.body[key] });
      }
    });

    /**
     * Verifica se o cliente existe.
     */
    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Não foi encontrado um cliente com o ID especificado.',
      });
    }

    /**
     * Verifica se o documento não foi utilizado.
     */
    const documentExists = await Client.findOne({
      where: {
        document: updateFields.document,
      },
    });

    if (documentExists && updateFields.document !== client.document) {
      return res.status(400).json({
        error: `O documento já está em uso pelo cliente ${documentExists.id}.`,
      });
    }

    /**
     * Verifica se o representante existe.
     */
    const salesmanExists = await Salesman.findByPk(updateFields.salesman_id);

    if (updateFields.salesman_id && !salesmanExists) {
      return res
        .status(404)
        .json({ error: 'O representante indicado não está cadastrado.' });
    }

    /**
     * Atualiza o cliente.
     */
    await client.update(updateFields);

    return res.status(200).json(client);
  }

  async delete(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const client = await Client.findByPk(req.params.id);

    if (!client) {
      return res.status(404).json({
        error: 'Não foi encontrado um cliente com o ID especificado.',
      });
    }

    await client.destroy();

    return res.status(200).json({ msg: 'Cliente deletado com sucesso.' });
  }
}

export default new ClientController();
