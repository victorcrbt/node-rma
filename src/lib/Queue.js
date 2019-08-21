import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import RecoveryPasswordMail from '../app/jobs/RecoveryPasswordMail';
import ProductExchangeMail from '../app/jobs/ProductExchangeMail';

const jobs = [RecoveryPasswordMail, ProductExchangeMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  init() {
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee({
          redis: redisConfig,
          activateDelayedJobs: true,
          nearTermWindow: 30000,
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee
      .createJob(job)
      .retries(3)
      .save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.process(handle);
    });
  }
}

export default new Queue();
