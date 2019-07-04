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
import EmployeeController from './app/controllers/EmployeeController';
import SalesmanController from './app/controllers/SalesmanController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
routes.post('/users', UserController.store);

routes.post('/sessions', SessionController.store);

// Rotas que necessitam autenticação
routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users', UserController.update);

routes.get('/status', StatusController.index);

routes.get('/warranty_types', WarrantyTypeController.index);

routes.get('/brands', BrandController.index);
routes.post('/brands', BrandController.store);
routes.put('/brands/:id', BrandController.update);
routes.delete('/brands/:id', BrandController.delete);

routes.get('/employees', EmployeeController.index);
routes.get('/employees/:id', EmployeeController.show);
routes.post('/employees', EmployeeController.store);
routes.put('/employees/:id', EmployeeController.update);
routes.delete('/employees/:id', EmployeeController.delete);

routes.get('/salesmen', SalesmanController.index);
routes.get('/salesmen/:id', SalesmanController.show);
routes.post('/salesmen', SalesmanController.store);
routes.put('/salesmen/:id', SalesmanController.update);
routes.delete('/salesmen/:id', SalesmanController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
