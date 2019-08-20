import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';

import SessionController from './app/controllers/SessionController';
import validateSessionStore from './app/validators/SessionStore';

import DashboardController from './app/controllers/DashboardController';
import StatusController from './app/controllers/StatusController';
import WarrantyTypeController from './app/controllers/WarrantyTypeController';

import BrandController from './app/controllers/BrandController';
import validateBrandStore from './app/validators/BrandStore';
import validateBrandUpdate from './app/validators/BrandUpdate';

import EmployeeController from './app/controllers/EmployeeController';
import validateEmployeeStore from './app/validators/EmployeeStore';
import validateEmployeeUpdate from './app/validators/EmployeeUpdate';

import SalesmanController from './app/controllers/SalesmanController';
import validateSalesmanStore from './app/validators/SalesmanStore';
import validateSalesmanUpdate from './app/validators/SalesmanUpdate';

import ClientController from './app/controllers/ClientController';
import validateClientStore from './app/validators/ClientStore';
import validateClientUpdate from './app/validators/ClientUpdate';

import ProductController from './app/controllers/ProductController';
import validateProductStore from './app/validators/ProductStore';
import validateProductUpdate from './app/validators/ProductUpdate';

import RegisterController from './app/controllers/RegisterController';
import validateRegisterStore from './app/validators/RegisterStore';
import validateRegisterUpdate from './app/validators/RegisterUpdate';

import SyncProductController from './app/controllers/SyncProductController';
import SyncBrandController from './app/controllers/SyncBrandController';
import SyncClientsController from './app/controllers/SyncClientsController';
import SyncSalesmanController from './app/controllers/SyncSalesmanController';

import ResetPasswordController from './app/controllers/ResetPasswordController';
import FileController from './app/controllers/FileController';

import SyncRegisterController from './app/controllers/SyncRegisterController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
routes.post('/users', validateUserStore, UserController.store);

routes.post('/sessions', validateSessionStore, SessionController.store);

routes.post('/reset_password', ResetPasswordController.store);

// Rotas que necessitam autenticação
routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users', validateUserUpdate, UserController.update);

routes.get('/dashboard', DashboardController.index);

routes.get('/status', StatusController.index);

routes.get('/warranty_types', WarrantyTypeController.index);

routes.get('/brands', BrandController.index);
routes.get('/brands/:id', BrandController.show);
routes.post('/brands', validateBrandStore, BrandController.store);
routes.put('/brands/:id', validateBrandUpdate, BrandController.update);
routes.delete('/brands/:id', BrandController.delete);

routes.get('/employees', EmployeeController.index);
routes.get('/employees/:id', EmployeeController.show);
routes.post('/employees', validateEmployeeStore, EmployeeController.store);
routes.put('/employees/:id', validateEmployeeUpdate, EmployeeController.update);
routes.delete('/employees/:id', EmployeeController.delete);

routes.get('/salesmen', SalesmanController.index);
routes.get('/salesmen/:id', SalesmanController.show);
routes.post('/salesmen', validateSalesmanStore, SalesmanController.store);
routes.put('/salesmen/:id', validateSalesmanUpdate, SalesmanController.update);
routes.delete('/salesmen/:id', SalesmanController.delete);

routes.get('/clients', ClientController.index);
routes.get('/clients/:id', ClientController.show);
routes.post('/clients', validateClientStore, ClientController.store);
routes.put('/clients/:id', validateClientUpdate, ClientController.update);
routes.delete('/clients/:id', ClientController.delete);

routes.get('/products', ProductController.index);
routes.get('/products/:id', ProductController.show);
routes.post('/products', validateProductStore, ProductController.store);
routes.put('/products/:id', validateProductUpdate, ProductController.update);
routes.delete('/products/:id', ProductController.delete);

routes.get('/registers', RegisterController.index);
routes.get('/registers/:id', RegisterController.show);
routes.post('/registers', validateRegisterStore, RegisterController.store);
routes.put('/registers/:id', validateRegisterUpdate, RegisterController.update);
routes.delete('/registers/:id', RegisterController.delete);

routes.get('/sync/brands', SyncBrandController.sync);
routes.get('/sync/products', SyncProductController.sync);
routes.get('/sync/salesmen', SyncSalesmanController.sync);
routes.get('/sync/clients', SyncClientsController.sync);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/sync/registers', SyncRegisterController.store);

export default routes;
