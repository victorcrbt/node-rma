import { parse } from 'date-fns';

import User from '../models/User';
import Register from '../models/Register';

import Queue from '../../lib/Queue';
import ProductExchangeMail from '../jobs/ProductExchangeMail';

class UpdateRegisterService {
  async run({ user_id, user_input, register_id }) {
    const { admin, employee } = await User.findByPk(user_id);

    if (!admin && !employee) {
      const error = new Error(
        'Você não tem permissão para realizar esta ação.'
      );
      error.status = 401;
      throw error;
    }

    const {
      warranty_type_id,
      status_id,
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
    } = user_input;

    const register = await Register.findByPk(register_id, {
      include: [
        {
          association: 'client',
        },
        { association: 'product' },
      ],
    });

    if (!register) {
      const error = new Error(
        'Não foi encontrado um registro com o ID especificado.'
      );
      error.status = 404;
      throw error;
    }

    let updateFields = {
      warranty_type_id: Number(warranty_type_id),
      status_id: Number(status_id),
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
    };

    if (
      register.warranty_type_id === 1 &&
      updateFields.warranty_type_id === 2
    ) {
      updateFields = {
        ...updateFields,
        exchange_mail: true,
      };
    }

    if (
      updateFields.warranty_type_id === 2 &&
      register.exchange_mail === false
    ) {
      console.log('entrou aqui');
      await Queue.add(ProductExchangeMail.key, { register });
    }

    if (status_id && status_id !== register.status_id) {
      updateFields = {
        ...updateFields,
        last_status_date: parse(new Date()),
      };
    }

    return register.update(updateFields, {
      where: {
        id: register_id,
      },
    });
  }
}

export default new UpdateRegisterService();
