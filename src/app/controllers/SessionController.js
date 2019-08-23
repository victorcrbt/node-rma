import jwt from 'jsonwebtoken';
import * as yup from 'yup';

import jwtConfig from '../../config/jwt';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ association: 'avatar' }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const {
      id,
      name,
      reference_id,
      employee,
      admin,
      client,
      salesman,
      // avatar_id,
    } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        reference_id,
        employee,
        admin,
        client,
        salesman,
        // avatar_id,
        avatar: user.avatar ? user.avatar : null,
      },
      token: jwt.sign({ id, reference_id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
