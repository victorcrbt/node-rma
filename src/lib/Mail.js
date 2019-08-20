import nodemailer from 'nodemailer';

import mailConfig from '../config/mail';

class Mail {
  constructor() {
    const { service, host, port, secure, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      // host,
      // port,
      // secure,
      service,
      auth: auth.user ? auth : null,
    });
  }

  sendMail(msg) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...msg,
    });
  }
}

export default new Mail();
