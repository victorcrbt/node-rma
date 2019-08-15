import IndexClientService from '../services/IndexClientService';
import StoreClientService from '../services/StoreClientService';
import UpdateClientService from '../services/UpdateClientService';

import Client from '../models/Client';
import User from '../models/User';

class ClientController {
  async index(req, res) {
    try {
      const clients = await IndexClientService.run({
        query_params: req.query,
        user_id: req.userId,
        ref_id: req.refId,
      });

      return res.status(200).json(clients);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  async show(req, res) {
    const {
      admin,
      employee,
      salesman,
      client: isClient,
      reference_id,
    } = await User.findByPk(req.userId);

    /**
     * Se, por algum motivo, o usuário não tiver nenhum tipo definido, não permite a visualização.
     */
    if (!isClient && !admin && !employee && !salesman) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for um cliente, não permite a visualização.
     */
    if (isClient) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const client = await Client.findByPk(req.params.id);

    /**
     * Se o usuário for um representante, e o cliente não pertencer à ele, não permite a visualização.
     */
    if (salesman && reference_id !== client.salesman_id) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    if (!client) {
      return res.status(404).json({
        error: 'Não foi encontrado um cliente com o ID especificado.',
      });
    }

    return res.status(200).json(client);
  }

  async store(req, res) {
    try {
      const client = await StoreClientService.run({
        user_id: req.userId,
        user_input: req.body,
      });

      return res.status(201).json(client);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const client = await UpdateClientService.run({
        client_id: req.params.id,
        user_id: req.userId,
        user_input: req.body,
      });

      return res.status(200).json(client);
    } catch (err) {
      return res.status(err.status || 500).json({ eror: err.message });
    }
  }

  async delete(req, res) {
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
