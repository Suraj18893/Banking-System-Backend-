const jwt = require("jsonwebtoken");

const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();

const dotenv = require("dotenv");
dotenv.config();
const secret = process.env.TOKEN_SECRET;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(" ")[1];
    const decoded = jwt.verify(token, secret);
    const result = await client.query(
      "SELECT id from user_data where id = $1",
      [decoded.id]
    );
    const user = result.rows[0];
    if (user) {
      console.log("usojfke");
      req.user = user;
      req.token = token;
      next();
    } else {
      throw new Error("Error while authentication");
    }
  } catch (error) {
    next(error);
  }
};
module.exports = authMiddleware;
