import WarrantyType from '../models/WarrantyType';

class WarrantyTypeController {
  async index(req, res) {
    const types = await WarrantyType.findAll({
      attributes: ['id', 'description']
    })

    return res.status(200).json(types);
  }
}

export default new WarrantyTypeController();
