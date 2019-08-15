import CountStatusDashboardService from '../services/CountStatusDashboardService';
import DeliveryCostsDashboardService from '../services/DeliveryCostsDashboardService';
import RepairCostsDashboardService from '../services/RepairCostsDashboardService';

class DashboardController {
  async index(req, res) {
    const statusCount = await CountStatusDashboardService.run({
      user_id: req.userId,
    });
    const deliveryCosts = await DeliveryCostsDashboardService.run();
    const repairCosts = await RepairCostsDashboardService.run();

    return res.json({ statusCount, deliveryCosts, repairCosts });
  }
}

export default new DashboardController();
