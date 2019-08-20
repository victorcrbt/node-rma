import crypto from 'crypto';
import { addDays } from 'date-fns';

import User from '../models/User';

import Mail from '../../lib/Mail';

class ResetPasswordController {
  async store(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        error: 'Não foi encontrado um usuário com o e-mail informado.',
      });
    }

    const token = await crypto
      .createHash('md5')
      .update(`${user.email}${new Date()}}`)
      .digest('hex');

    user.reset_token = token;
    user.token_expiration = addDays(new Date(), 1);

    user.save();

    try {
      await Mail.sendMail({
        to: `${user.name} <${user.email}>`,
        subject: 'Alteração de senha',
        template: 'recoveryPassword',
        context: {
          name: user.name,
          token,
        },
      });
    } catch (err) {
      console.log(err);
    }

    return res.json({
      message:
        'Você receberá em instantes um e-mail com instruções para alterar sua senha.',
    });
  }

  async update(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ where: { reset_token: token } });

    if (!user) {
      return res.status(404).json({
        error: 'Não foi encontrado uma solicitação com o token indicado.',
      });
    }

    if (user.token_expiration < new Date()) {
      return res.status(400).json({
        error:
          'O token enviado está expirado. Favor solicitar uma nova alteração de senha.',
      });
    }

    user.update({ password, reset_token: null, token_expiration: null });

    return res.status(200).json({ message: 'Senha alterada com sucesso!' });
  }
}

export default new ResetPasswordController();
