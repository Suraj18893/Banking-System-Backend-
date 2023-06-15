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

const insertIntoAccount = async ({ Id, userName, isSaving, isCurrent }) => {
  return client.query(`insert into account values($1, $2, $3, $4, $5)`, [
    Id,
    userName,
    isSaving,
    isCurrent,
    false,
  ]);
};

const insertIntoSaving = async ({
  Id,
  savingBalance,
  atm_number,
  expiryDate,
  cvv_number,
  no_of_atm_transections,
  savingAccountNumber,
  dateOfOpening,
}) => {
  return client.query(
    `insert into saving_accounts values($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      savingBalance,
      atm_number,
      expiryDate,
      cvv_number,
      no_of_atm_transections,
      savingAccountNumber,
      dateOfOpening,
      Id,
    ]
  );
};

const insertIntoCurrent = async ({
  Id,
  currentBalance,
  no_of_transections,
  currentAccountNumber,
  dateOfOpening,
}) => {
  return client.query(
    `insert into current_accounts values($1, $2, $3, $4, $5)`,
    [
      currentBalance,
      no_of_transections,
      Id,
      currentAccountNumber,
      dateOfOpening,
    ]
  );
};

const insertIntoUser = async ({
  Id,
  fullname,
  email,
  phonenumber,
  hashedPassword,
  dob,
  userName,
}) => {
  return client.query(
    `insert into user_data values($1, $2, $3, $4, $5, $6, $7)`,
    [Id, fullname, email, phonenumber, hashedPassword, dob, userName]
  );
};

const insertIntoLoan = async ({
  Id,
  loanBalance,
  loanAmount,
  loanType,
  loanEndDate,
  todayDate,
  loanAccountNumber
}) => {
  return client.query(`insert into loan_accounts values($1,$2,$3,$4,$5,$6,$7)`, [
    loanBalance,
    loanAmount,
    loanType,
    loanEndDate,
    todayDate,
    loanAccountNumber,
    Id,
  ]);
};

const updateIntoAccount = async (Id) => {
  return client.query(`update account set is_loan = $1 where id=$2`, [
    true,
    Id,
  ]);
};

const updateIntoAccountSavingCurrent = async ({ Id, isSaving, isCurrent }) => {
  const res = await client.query(
    `update account set is_saving = $1, is_current=$2 where id=$3`,
    [isSaving, isCurrent, Id]
  );
};

module.exports = {
  insertIntoAccount,
  insertIntoSaving,
  insertIntoCurrent,
  insertIntoUser,
  insertIntoLoan,
  updateIntoAccount,
  updateIntoAccountSavingCurrent,
};

//testing

// InsertIntoAccountUpdate({
//   Id: 783196967,
//   userName: "xanuxs",
//   isSaving: true,
//   isCurrent: true,
//   dateOfOpening: new Date(),
// }).then((res) => console.log(res));
