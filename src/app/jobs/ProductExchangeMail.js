import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class ProductExchangeMail {
  get key() {
    return 'ProductExchangeMail';
  }

  async handle({ data }) {
    const { register } = data;

    const { client } = register;
    const { product } = register;

    try {
      const response = await Mail.sendMail({
        to: `Victor Batalha <victor@distribuidoramr.com>`,
        subject: 'Troca Zero Hora',
        template: 'productExchange',
        context: {
          id: register.id,
          client: `${client.id} - ${client.company_name}`,
          product: `${product.id} - ${product.description}`,
          currentDate: format(new Date(), 'd [de] MMMM [de] YYYY[, às] HH:mm', {
            locale: pt,
          }),
        },
      });

      console.log('ok', response);
    } catch (err) {
      console.log('error', err);
    }
  }
}

export default new ProductExchangeMail();
