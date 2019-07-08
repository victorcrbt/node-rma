import { Op } from 'sequelize';

import Client from '../models/Client';
import User from '../models/User';
import Salesman from '../models/Salesman';

class ClientController {
  async index(req, res) {
    const where = {};

    const {
      id,
      company_name,
      document,
      address,
      address_number,
      city,
      state,
    } = req.query;

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
     * Verifica se a cidade foi enviada
     */
    if (city) {
      where.city = { [Op.iLike]: `%${city}%` };
    }

    /**
     * Verifica se o estado foi enviado
     */
    if (state) {
      where.state = { [Op.iLike]: `${state}` };
    }

    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee, salesman, client } = await User.findByPk(
      req.userId
    );

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
    const clients = await Client.findAll();

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
