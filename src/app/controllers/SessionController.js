import jwt from 'jsonwebtoken';
import * as yup from 'yup';

import jwtConfig from '../../config/jwt';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const validationSchema = yup.object().shape({
      email: yup.string().required('O e-mail não pode estar em branco.'),
      password: yup.string().required('A senha não pode estar em branco.'),
    });

    // Validação dos campos
    try {
      // Procura por erros na entrada de dados. Se não houver, prossegue com o código.
      await validationSchema.validate(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const errors = [];

      // Lista todos os erros e insere no array o campo e a mensagem de cada um.
      err.inner.map(error => {
        const infos = {
          field: error.path,
          msg: error.message,
        };

        errors.push(infos);
      });

      // Se existir qualque erro de validação, retorna em formato json com o campo e a mensagem.
      return res.status(400).json(errors);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const { id, name, reference_id, employee, admin, client, salesman } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        reference_id,
        employee,
        admin,
        client,
        salesman
      },
      token: jwt.sign({ id, reference_id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
