import Mail from '../../lib/Mail';

class RecoveryPasswordMail {
  get key() {
    return 'RecoveryPasswordMail';
  }

  async handle({ data }) {
    const { user, token } = data;

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: 'Alteração de senha',
      template: 'recoveryPassword',
      context: {
        name: user.name,
        token,
      },
    });
  }
}

export default new RecoveryPasswordMail();
