import { parse } from 'date-fns';

import Register from '../models/Register';
import User from '../models/User';

import IndexRegisterService from '../services/IndexRegisterService';
import ShowRegisterService from '../services/ShowRegisterService';
import StoreRegisterService from '../services/StoreRegisterService';
import UpdateRegisterService from '../services/UpdateRegisterService';

class RegisterController {
  async index(req, res) {
    try {
      const registers = await IndexRegisterService.run({
        query_params: req.query,
        user_id: req.userId,
        reference_id: req.refId,
      });

      return res.status(200).json(registers);
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async show(req, res) {
    try {
      const register = await ShowRegisterService.run({
        register_id: req.params.id,
        user_id: req.userId,
        reference_id: req.refId,
      });

      return res.status(200).json(register);
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }

  async store(req, res) {
    try {
      const register = await StoreRegisterService.run({
        user_id: req.userId,
        user_input: req.body,
      });

      return res.json(register);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const register = await UpdateRegisterService.run({
        user_id: req.userId,
        user_input: req.body,
        register_id: req.params.id,
      });

      return res.status(200).json(register);
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    try {
      const register = await Register.findByPk(req.params.id);

      if (!register) {
        return res.status(404).json({
          error: 'Não foi encontrado um registro com o ID especificado.',
        });
      }

      try {
        await register.destroy();

        return res.status(200).json({ msg: 'Registro deletado com sucesso.' });
      } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}

export default new RegisterController();
