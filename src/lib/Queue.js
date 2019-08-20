import Bee from 'bee-queue';

import redisConfig from '../config/redis';

import RecoveryPasswordMail from '../app/jobs/RecoveryPasswordMail';

const jobs = [RecoveryPasswordMail];

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
        }),
        handle,
      };
    });
  }

  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      console.log(this.queues[job.key].handle);

      bee.process(handle);
    });
  }
}

export default new Queue();
