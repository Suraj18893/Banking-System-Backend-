const { findUserId } = require("../utilities/libs");
const dotenv = require('dotenv').config({path: '../.env'});

const { Client } = require("pg");
const { findUserPassbook } = require("../models/userModels");


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


const fetchPassbook = async({userName}, onfetchPassbook = undefined) => {
  await (async () => {
    const Id = findUserId(userName);
    const resfindUserPassbook = await findUserPassbook(Id);
    console.log(resfindUserPassbook.rows);
    if (onfetchPassbook) onfetchPassbook(resfindUserPassbook.rows);
  })()
};

module.exports = {
  fetchPassbook,
};
