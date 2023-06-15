const { findUserId } = require("../utilities/libs");
const dotenv = require("dotenv").config({ path: "../.env" });

const { Client } = require("pg");

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

const findDob = async (Id) => {
  return client.query(`select dob from user_data where id=$1`, [Id]);
};

const findUser = async (Id) => {
  return client.query(`select * from user_data where id=$1`, [Id]);
};

const findUserSaving = async (Id) => {
  return client.query(`select * from saving_accounts where id=$1`, [Id]);
};

const findUserCurrent = async (Id) => {
  return client.query(`select * from current_accounts where id=$1`, [Id]);
};

const findUserAccount = async (Id) => {
  return client.query(`select * from account where id=$1`, [Id]);
};

const findUserLoan = async (Id) => {
  return client.query(`select * from loan_accounts where id=$1`, [Id]);
};

const findUserPassbook = async(Id)=>{
  return client.query(
    `select id, amount, transection_type, date_of_transection, transection_id, account_number from transections where id=$1`,
    [Id]
  );

}


const totalWithDrawAmountSaving = async ({
  Id,
  formattedDate,
  transectionType1,
  transectionType2,
  accountNumber,
}) => {
  return client.query(
    `select sum(amount) from transections where id=$1 and Date(date_of_transection)=$2 and account_number=$3 and (transection_type=$4 or transection_type=$5)`,
    [Id, formattedDate, accountNumber, transectionType1, transectionType2]
  );
};
module.exports = {
  findDob,
  findUser,
  findUserSaving,
  findUserCurrent,
  findUserAccount,
  findUserLoan,
  totalWithDrawAmountSaving,
  findUserPassbook,
};
