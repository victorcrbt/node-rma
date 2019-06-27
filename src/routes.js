import { Router } from 'express';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Rotas sem autenticação
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

export default routes;
