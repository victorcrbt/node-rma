import Product from '../models/Product';
import User from '../models/User';
import Brand from '../models/Brand';

class ProductController {
  async index(req, res) {
    const products = await Product.findAll({
      attributes: ['id', 'brand_id', 'description', 'unit', 'ncm'],
    });

    return res.status(200).json(products);
  }

  async show(req, res) {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'brand_id', 'description', 'unit', 'ncm'],
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    return res.status(200).json(product);
  }

  async store(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Verifica e o ID já foi utilizado.
     */
    const idExists = await Product.findByPk(req.body.id);

    if (idExists) {
      return res.status(400).json({ error: 'O ID já está em uso.' });
    }

    /**
     * Verifica se existe outro produto com a mesma descrição.
     */
    const descriptionExists = await Product.findOne({
      where: {
        description: req.body.description,
      },
    });

    if (descriptionExists) {
      return res.status(400).json({
        error: `Descriçao já utilizada no produto ${descriptionExists.id}.`,
      });
    }

    /**
     * Verifica se a marca está cadastrada.
     */
    const brandExists = await Brand.findByPk(req.body.brand_id);

    if (!brandExists) {
      return res
        .status(404)
        .json({ error: 'A marca informada não está cadastrada.' });
    }

    /**
     * Insere o produto no banco de dados.
     */
    const product = await Product.create(req.body);

    return res.status(201).json(product);
  }

  async update(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    /**
     * Remove o ID dos campos que podem ser atualizados.
     */
    let updateFields = {};

    Object.keys(req.body).map(key => {
      if (key !== 'id') {
        return (updateFields = { ...updateFields, [key]: req.body[key] });
      }
    });

    /**
     * Verifica se o produto existe.
     */
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    /**
     * Salva as atualizações.
     */
    await product.update(req.body);

    return res.json(product);
  }

  async delete(req, res) {
    /**
     * Verifica se o usuário é administrador ou funcionário comum.
     */
    const { admin, employee } = await User.findByPk(req.userId);

    if (!admin && !employee) {
      return res
        .status(401)
        .json({ error: 'Você não tem permissão para realizar esta ação.' });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ error: 'Não foi encontrado um produto com o ID informado.' });
    }

    await product.destroy();

    return res.status(200).json({ msg: 'Produto deletado com sucesso.' });
  }
}

export default new ProductController();
