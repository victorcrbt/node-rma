import Status from '../models/Status';

class StatusController {
  async index(req, res) {
    const status = await Status.findAll({
      attributes: ['id', 'description']
    });

    return res.status(200).json(status);
  }
}

export default new StatusController();
