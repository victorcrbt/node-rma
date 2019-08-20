export default {
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'MR Distribuidora - Setor de Garantias <lilian@distribuidoramr.com>',
  },
};
