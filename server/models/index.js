const sequelize = require('../db/sequelize');

(async () => await sequelize.authenticate())();

(async () => await sequelize.sync({ alter: true }))();