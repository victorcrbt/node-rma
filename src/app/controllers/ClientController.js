import Client from '../models/Client';
import Salesman from '../models/Salesman';

class ClientController {
  async index(req, res) {
    const client = await Client.findAll({
      include: [
        {
          model: Salesman,
          as: 'salesman',
          attributes: ['id', 'name', 'document']
        }
      ]
    })

    return res.status(200).json(client);
  }

  async store(req, res) {
    const client = await Client.create(req.body);

    return res.status(201).json(client);
  }
}

export default new ClientController();
