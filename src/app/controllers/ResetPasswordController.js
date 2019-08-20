import crypto from 'crypto';
import { addDays } from 'date-fns';

import User from '../models/User';

class ResetPasswordController {
  async store(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: 'Não foi encontrado um usuário com o e-mail informado.',
      });
    }

    const expirtaionToken = await crypto
      .createHash('md5')
      .update(`${user.email}${new Date()}}`)
      .digest('hex');

    user.reset_token = expirtaionToken;
    user.token_expiration = addDays(new Date(), 1);

    user.save();

    return res.json({
      message:
        'Você receberá em instantes um e-mail com instruções para alterar sua senha.',
    });
  }

  async update(req, res) {
    const { token } = req.params;

    const user = await User.findOne({ where: { reset_token: token } });

    return res.status(200).json(user);
  }
}

export default new ResetPasswordController();
