import 'dotenv/config';

import express from 'express';
import { resolve } from 'path';

import routes from './routes';

// Conexão ao banco de dados
import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use('/static/images', express.static(resolve(__dirname, '..', 'temp', 'uploads')));
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
