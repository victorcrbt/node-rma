import Client from '../models/Client';
import User from '../models/User';
import Salesman from '../models/Salesman';

class ClientController {
  async index(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee, salesman, client } = await User.findByPk(req.userId);

    /**
     * Verifica se todos os tipos estão falsos.
     */
    if (!client && !admin && !employee && !salesman) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for cliente, não permite a visualização de outros clientes.
     */
    if (client) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Se o usuário for vendedor, lista apenas os seus clientes.
     */
    if (salesman) {
      const clients = await Client.findAll({
        where: {
          salesman_id: req.refId
        }
      })

      return res.status(200).json(clients);
    }

    /**
     * Se o usuário for administrador e/ou funcionário comum, retorna todos os clientes.
     */
    const clients = await Client.findAll();

    return res.status(200).json(clients);
  }

  async store(req, res) {
    /**
     * Verifica se o usuário é um administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.' })
    }

    /**
     * Verifica se o ID já foi utilizado.
     */
    const usedId = await Client.findByPk(req.body.id);

    if (usedId) {
      return res.status(400).json({ error: 'O ID já está em uso.' })
    }

    /**
     * Verifica se o documento já foi utilizado.
     */
    const usedDocument = await Client.findOne({
      where: {
        document: req.body.document
      }
    })

    if (usedDocument) {
      return res.status(400).json({ error: `O documento já está em uso pelo cliente ${usedDocument.id}.` })
    }

    const client = await Client.create(req.body);

    return res.status(201).json(client);
  }
}

export default new ClientController();
