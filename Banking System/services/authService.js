const dotenv = require('dotenv').config({path: '../.env'});
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const HOST = process.env.HOST;
const USER = process.env.USER;
const PORT = process.env.PORT;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;


const client = new Client({
  host: HOST,
  user: USER,
  port: PORT,
  password: PASSWORD,
  database: DATABASE,
});

client.connect();

const jwt = require("jsonwebtoken");

const secret = process.env.TOKEN_SECRET;

const { findUserId } = require("../utilities/libs");

const validateUser = async (userName, password) => {
  const Id = findUserId(userName);

  const res = await client.query(
    `select id, pass_word from user_data where id=$1`,
    [Id]
  );

  if (res.rows[0] && await bcrypt.compare(password, res.rows[0].pass_word)) {
    const user = res.rows[0];
    user.userName = userName;
    return user;
  }
};

const genrateAuthToken = async (user) => {
  const { id, password, userName } = user;
  const token = await jwt.sign({ id, userName }, secret, {
    expiresIn: "12h",
  });
  return token;
};

module.exports = {
  genrateAuthToken,
  validateUser,
};
