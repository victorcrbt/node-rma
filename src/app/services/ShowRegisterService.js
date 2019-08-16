import User from '../models/User';
import Register from '../models/Register';

class ShowRegisterService {
  async run({ register_id, user_id, reference_id }) {
    let where = {
      id: register_id,
    };

    /**
     * Verifica o tipo de usuário para retornar os dados de acordo.
     */
    const { salesman, client } = await User.findByPk(user_id);

    if (salesman) {
      where['$client.salesman.id$'] = reference_id;
    }

    if (client) {
      where = {
        ...where,
        client_id: reference_id,
      };
    }

    return Register.findOne({
      where,
      include: [
        {
          association: 'user',
          attributes: ['id', 'name'],
        },
        {
          association: 'client',
          attributes: [
            'id',
            'salesman_id',
            'company_name',
            'document',
            'address',
            'address_number',
            'neighborhood',
            'zip_code',
            'city',
            'state',
            'phone',
            'email',
          ],
          include: [
            {
              association: 'salesman',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          association: 'warranty_type',
          attributes: ['id', 'description'],
        },
        {
          association: 'status',
          attributes: ['id', 'description'],
        },
        {
          association: 'product',
          attributes: ['id', 'description', 'unit'],
          include: [
            {
              association: 'brand',
              attributes: ['id', 'description'],
            },
          ],
        },
      ],
    });
  }
}

export default new ShowRegisterService();
