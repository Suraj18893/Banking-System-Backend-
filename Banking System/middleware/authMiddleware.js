const jwt = require("jsonwebtoken");

const { Client } = require("pg");
const { findUserId } = require("../utilities/libs");
const dotenv = require('dotenv').config({path: '../.env'});
const secret = process.env.TOKEN_SECRET;

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


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, secret);
    const Id = findUserId(req.body.userName);
    const result = await client.query(
      "SELECT id from user_data where id = $1",
      [decoded.id]
    );
    const user = result.rows[0];
    if (user && ((Id == decoded.id) || (req.body.senderId == decoded.id))) {
      req.user = user;
      req.token = token;
      next();
    } else {
      res.json({sts:"failed", message:"error while authentication"})
      // throw new Error("Error while authentication");
    }
  } catch (error) {
    next(error);
  }
};
module.exports = authMiddleware;
