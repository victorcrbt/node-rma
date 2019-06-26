module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'node-rma',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
