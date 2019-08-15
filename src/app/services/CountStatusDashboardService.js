import { Op } from 'sequelize';
import { subDays, startOfDay, parse } from 'date-fns';

import Status from '../models/Status';
import User from '../models/User';
import Client from '../models/Client';
import Register from '../models/Register';

class CountStatusDashboardService {
  async run({ user_id }) {
    const {
      reference_id,
      client: isClient,
      salesman: isSalesman,
    } = await User.findByPk(user_id);

    const getStatus = () => {
      return Status.findAll({
        attributes: ['id', 'description'],
      });
    };

    const countStatus = async statusList => {
      const where = {};
      const count = [];

      if (isClient) {
        where.client_id = reference_id;
      }

      if (isSalesman) {
        where['$client.salesman_id$'] = reference_id;
      }

      await Promise.all(
        statusList.map(async ({ id, description }) => {
          where.status_id = id;

          const date = new Date();

          if (id === 6) {
            where.last_status_date = {
              [Op.between]: [subDays(parse(startOfDay(date)), 30), parse(date)],
            };
          }

          const info = {
            id,
            description,
            amount: await Register.count({
              where,
              include: [
                {
                  model: Client,
                  as: 'client',
                },
              ],
            }),
          };

          count.push(info);
        })
      );

      return count;
    };

    const status = await getStatus();
    // const statusCount = await countStatus(status);

    return countStatus(status);
  }
}

export default new CountStatusDashboardService();
