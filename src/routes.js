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
import ClientController from './app/controllers/ClientController';
import ProductController from './app/controllers/ProductController';
import RegisterController from './app/controllers/RegisterController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
/**
 * Usuários
 */
routes.post('/users', UserController.store);

/**
 * Sessão
 */
routes.post('/sessions', SessionController.store);

// Rotas que necessitam autenticação
routes.use(authMiddleware);

/**
 * Usuários
 */
routes.get('/users', UserController.index);
routes.put('/users', UserController.update);

/**
 * Status
 */
routes.get('/status', StatusController.index);

/**
 * Tipos de garantia
 */
routes.get('/warranty_types', WarrantyTypeController.index);

/**
 * Marcas
 */
routes.get('/brands', BrandController.index);
routes.post('/brands', BrandController.store);
routes.put('/brands/:id', BrandController.update);
routes.delete('/brands/:id', BrandController.delete);

/**
 * Funcionários
 */
routes.get('/employees', EmployeeController.index);
routes.get('/employees/:id', EmployeeController.show);
routes.post('/employees', EmployeeController.store);
routes.put('/employees/:id', EmployeeController.update);
routes.delete('/employees/:id', EmployeeController.delete);

/**
 * Representantes
 */
routes.get('/salesmen', SalesmanController.index);
routes.get('/salesmen/:id', SalesmanController.show);
routes.post('/salesmen', SalesmanController.store);
routes.put('/salesmen/:id', SalesmanController.update);
routes.delete('/salesmen/:id', SalesmanController.delete);

/**
 * Clientes
 */
routes.get('/clients', ClientController.index);
routes.get('/clients/:id', ClientController.show);
routes.post('/clients', ClientController.store);
routes.put('/clients/:id', ClientController.update);
routes.delete('/clients/:id', ClientController.delete);

/**
 * Produtos
 */
routes.get('/products', ProductController.index);
routes.get('/products/:id', ProductController.show);
routes.post('/products', ProductController.store);
routes.put('/products/:id', ProductController.update);
routes.delete('/products/:id', ProductController.delete);

/**
 * Registros
 */
routes.post('/registers', RegisterController.store);

/**
 * Arquivos
 */
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
