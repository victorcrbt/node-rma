import { Op } from 'sequelize';
import {
  parse,
  subDays,
  startOfDay,
  subMonths,
  getMonth,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

import Register from '../models/Register';
import Client from '../models/Client';
import Status from '../models/Status';
import User from '../models/User';

class DashboardController {
  async index(req, res) {
    const { reference_id, client: isClient, salesman: isSalesman } = await User.findByPk(req.userId);
    
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
                }
              ]
            }),
          };

          count.push(info);
        })
      );

      return count;
    };

    const sumDeliveryCosts = async () => {
      const date = new Date();

      const months = [
        subMonths(parse(date), 12),
        subMonths(parse(date), 11),
        subMonths(parse(date), 10),
        subMonths(parse(date), 9),
        subMonths(parse(date), 8),
        subMonths(parse(date), 7),
        subMonths(parse(date), 6),
        subMonths(parse(date), 5),
        subMonths(parse(date), 4),
        subMonths(parse(date), 3),
        subMonths(parse(date), 2),
        subMonths(parse(date), 1),
        subMonths(parse(date), 0),
      ];

      const costs = [];

      await Promise.all(
        months.map(async month => {
          const monthCost = {
            month: startOfMonth(month),
            cost: await Register.sum('delivery_cost', {
              where: {
                last_status_date: {
                  [Op.between]: [startOfMonth(month), endOfMonth(month)],
                },
              },
            }),
          };

          costs.push(monthCost);
        })
      );

      return costs;
    };

    const sumRepairCosts = async () => {
      const date = new Date();

      const months = [
        subMonths(parse(date), 12),
        subMonths(parse(date), 11),
        subMonths(parse(date), 10),
        subMonths(parse(date), 9),
        subMonths(parse(date), 8),
        subMonths(parse(date), 7),
        subMonths(parse(date), 6),
        subMonths(parse(date), 5),
        subMonths(parse(date), 4),
        subMonths(parse(date), 3),
        subMonths(parse(date), 2),
        subMonths(parse(date), 1),
        subMonths(parse(date), 0),
      ];

      const costs = [];

      await Promise.all(
        months.map(async month => {
          const monthCost = {
            month: startOfMonth(month),
            cost: await Register.sum('repair_cost', {
              where: {
                last_status_date: {
                  [Op.between]: [startOfMonth(month), endOfMonth(month)],
                },
              },
            }),
          };

          costs.push(monthCost);
        })
      );

      return costs;
    };

    const status = await getStatus();
    const statusCount = await countStatus(status);
    const deliveryCosts = await sumDeliveryCosts();
    const repairCosts = await sumRepairCosts();

    return res.json({ statusCount, deliveryCosts, repairCosts });
  }
}

export default new DashboardController();
