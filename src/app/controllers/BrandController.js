import Brand from '../models/Brand';
import User from '../models/User';

class BrandController {
  async store(req, res) {

    /**
     * Verifica se o usuário é um administrador ou funcionário.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!employee && !admin) {
      return res.status(401).json({ error: 'Você não tem permissão para realizar esta ação.', admin, employee })
    }

    const { id, description } = req.body;

    /**
     * Verifica se o ID  já foi utilizado.
     */
    const usedId = await Brand.findByPk(id);

    if (usedId) {
      return res.status(400).json({ error: "ID já utilizado."})
    }

    /**
     * Verifica se já existe uma marca com a mesma descrição.
     */
    const usedDescription = await Brand.findOne({
      where: {
        description,
      }
    });

    if (usedDescription) {
      return res.status(400).json({ error: 'Já existe uma marca cadastrada com esta descrição.' });
    }

    const brand = await Brand.create(req.body);

    return res.json(brand);
  }
}

export default new BrandController();
