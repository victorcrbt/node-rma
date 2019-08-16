import { parse } from 'date-fns';

import User from '../models/User';
import Register from '../models/Register';

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

    const register = await Register.findByPk(register_id);

    if (!register) {
      const error = new Error(
        'Não foi encontrado um registro com o ID especificado.'
      );
      error.status = 404;
      throw error;
    }

    let updateFields = {
      warranty_type_id,
      status_id,
      delivery_cost,
      repair_cost,
      exchange_value,
      register_observations,
    };

    if (
      warranty_type_id &&
      register.warranty_type_id !== 2 &&
      warranty_type_id !== register.warranty_type_id
    ) {
      updateFields = {
        ...updateFields,
        exchange_mail: true,
      };
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
