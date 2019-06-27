import * as yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const validationSchema = yup.object().shape({
      name: yup.string().required('O nome é obrigatório.'),
      email: yup
        .string()
        .email()
        .required('O e-mail é obrigatório.'),
      password: yup
        .string()
        .min(6, 'A senha deve conter pelo menos 6 dígitos.')
        .required('A senha é obrigatória.'),
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
          msg: error.message,
        };

        errors.push(infos);
      });

      return res.status(400).json(errors);
    }

    if (!(await validationSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação dos dados.' });
    }

    const { email } = req.body;

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      return res.status(400).json({ error: 'E-mail já utilizado.' });
    }

    const {
      name,
      admin,
      employee,
      salesman,
      client,
      reference_id,
    } = await User.create(req.body);

    return res.json({
      msg: 'Usuário cadastrado com sucesso!',
      name,
      email,
      admin,
      employee,
      salesman,
      client,
      reference_id,
    });
  }
}

export default new UserController();
