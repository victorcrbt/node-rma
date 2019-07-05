import Register from '../models/Register';
import User from '../models/User';
import Client from '../models/Client';
import Salesman from '../models/Salesman';
import WarrantyType from '../models/WarrantyType';
import Status from '../models/Status';
import Product from '../models/Product';
import Brand from '../models/Brand';

class RegisterController {
  async store(req, res) {
    return res.json();
  }
}

export default new RegisterController();
