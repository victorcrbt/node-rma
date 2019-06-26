import { Router } from 'express';

const routes = new Router();

routes.use("/", (req, res) => {
  return res.send("Olá, mundo!");
})

export default routes;