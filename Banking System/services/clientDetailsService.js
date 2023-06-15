const { findUserId } = require("../utilities/libs");
const dotenv = require("dotenv").config({ path: "../.env" });

const { Client } = require("pg");
const {
  findUser,
  findUserAccount,
  findUserSaving,
  findUserCurrent,
  findUserLoan,
} = require("../models/userModels");

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

const clientDetails = async ({ userName }, onClientDetails = undefined) => {
  const Id = findUserId(userName);

  await (async () => {
    const resUserData = await findUser(Id);
    const resUserAccountData = await findUserAccount(Id);
    const resUserSavingData = await findUserSaving(Id);
    const resUserCurrentData = await findUserCurrent(Id);
    const resUserLoanData = await findUserLoan(Id);

    let savingUserData ={};
    let currentUserData ={};
    let loanUserData ={};

    for (let i = 0; i < resUserSavingData.rows.length; i++) {
      let tempdata = {
        balance : resUserSavingData.rows[i].balance,
        accountNumber : resUserSavingData.rows[i].account_number
      }
      savingUserData[i]=tempdata;
    }
    for (let i = 0; i < resUserCurrentData.rows.length; i++) {
      let tempdata = {
        balance : resUserCurrentData.rows[i].balance,
        accountNumber : resUserCurrentData.rows[i].account_number
      }
      currentUserData[i]=tempdata;
    }
    for (let i = 0; i < resUserLoanData.rows.length; i++) {
      let tempdata = {
        balance : resUserLoanData.rows[i].loan_balance,
        accountNumber : resUserLoanData.rows[i].account_number
      }
      loanUserData[i]=tempdata;
    }



    const response = {
      userName: resUserData.rows[0].user_name,
      fullName: resUserData.rows[0].fullname,
      Email: resUserData.rows[0].email,
      phoneNumber: resUserData.rows[0].phonenumber,
      dateOfBirth: resUserData.rows[0].dob,
      savingBalance: resUserAccountData.rows[0].is_saving
        ? savingUserData
        : "You don't have saving account",
      currentBalance: resUserAccountData.rows[0].is_current
        ? currentUserData
        : "You don't have current account",
      loanBalance: resUserAccountData.rows[0].is_loan
        ? loanUserData
        : "You don't have loan account",
    };

    if (onClientDetails) onClientDetails(response);
  })();
};

// clientDetails({ userName: "praful" });

module.exports = {
  clientDetails,
};
