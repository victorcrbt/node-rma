import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

// Controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StatusController from './app/controllers/StatusController';
import WarrantyTypeController from './app/controllers/WarrantyTypeController';
import BrandController from './app/controllers/BrandController';
import FileController from './app/controllers/FileController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

// Rotas que necessitam autenticação
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.get('/status', StatusController.index);

routes.get('/warranty_types', WarrantyTypeController.index);

routes.post('/brands', BrandController.store);
routes.put('/brands/:id', BrandController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
