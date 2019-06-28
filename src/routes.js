import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.post('/files', upload.single('file'), FileController.store);
// Rotas que necessitam autenticação
routes.use(authMiddleware);

routes.put('/users', UserController.update);

export default routes;
