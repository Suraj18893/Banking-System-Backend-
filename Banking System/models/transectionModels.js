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

const updateBalanceIntoSaving = async ({
  newBalance,
  newNoAtmTransectionsPerMonth,
  Id,
  accountNumber,
}) => {
  return client.query(
    `update saving_accounts set balance = $1 , no_of_atm_transections=$2 where id=$3 and account_number=$4`,
    [newBalance, newNoAtmTransectionsPerMonth, Id, accountNumber]
  );
};

const updateBalanceIntoCurrent = async ({
  newBalance,
  NewNoOfTransectionsThisMonth,
  Id,
  accountNumber,
}) => {
  return client.query(
    `update current_accounts set balance = $1, no_of_transections_this_month=$2 where id=$3 and account_number=$4`,
    [newBalance, NewNoOfTransectionsThisMonth, Id, accountNumber]
  );
};

const updateBalanceIntoLoan = async ({ newLoanBalance, Id, accountNumber }) => {
  return client.query(`update loan_accounts set loan_balance=$1 where id=$2 and account_number=$3`, [
    newLoanBalance,
    Id,
    accountNumber
  ]);
};

const insertIntoTransection = async ({
  Id,
  TransectionMoney,
  transection_type,
  todayDate,
  transectionID,
  accountNumber,
}) => {
  return client.query(`insert into transections values($1, $2, $3, $4, $5, $6)`, [
    Id,
    TransectionMoney,
    transection_type,
    todayDate,
    transectionID,
    accountNumber,
  ]);
};

module.exports = {
  updateBalanceIntoSaving,
  insertIntoTransection,
  updateBalanceIntoCurrent,
  updateBalanceIntoLoan,
};
