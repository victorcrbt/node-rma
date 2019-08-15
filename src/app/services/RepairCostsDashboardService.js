import { subMonths, parse, startOfMonth, endOfMonth } from 'date-fns';
import { Op } from 'sequelize';

import Register from '../models/Register';

class RepairCostsDashboardService {
  async run() {
    return (async () => {
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
    })();
  }
}

export default new RepairCostsDashboardService();
