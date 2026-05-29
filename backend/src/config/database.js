const { Sequelize } = require('sequelize');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: { underscored: true, timestamps: true, freezeTableName: true },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host:    process.env.DB_HOST,
        port:    Number(process.env.DB_PORT),
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: { underscored: true, timestamps: true, freezeTableName: true },
      }
    );

module.exports = sequelize;
