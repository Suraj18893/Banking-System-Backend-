const { query } = require("express");
const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();

const { findUserId, addYears, calculate_age } = require("../utilities/libs");

const createNewAccount = (
  {
    userName,
    isSaving = false,
    isCurrent = false,
    savingBalance,
    currentBalance,
    dob,
  },
  onCreate = undefined
) => {
  const Id = findUserId(userName);
  const dateOfOpening = new Date();
  //Quering into main account table where all types of account are present;
  client.query(
    `insert into account values($1, $2, $3, $4, $5, $6)`,
    [Id, userName, isSaving, isCurrent, false, dateOfOpening],
    (err, res) => {
      if (err) console.log(err);
      else if (onCreate) onCreate("account created successfully");
    }
  );

  //Quering into main saving account table where saving accounts are present;

  if (isSaving && savingBalance) {
    const atm_number =
      (Math.random() + " ").substring(2, 10) +
      (Math.random() + " ").substring(2, 10);
    const expiryDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 5)
    );
    const cvv_number = Math.floor(Math.random() * (999 - 100 + 1) + 100);
    const no_of_atm_transections = 0;

    client.query(`insert into saving_accounts values($1, $2, $3, $4, $5, $6)`, [
      Id,
      savingBalance,
      atm_number,
      expiryDate,
      cvv_number,
      no_of_atm_transections,
    ]);
  }

  const no_of_transections = 0;
  if (isCurrent && currentBalance) {
    client.query(`insert into current_accounts values($1, $2, $3)`, [
      Id,
      currentBalance,
      no_of_transections,
    ]);
  }
};

const signup = (
  { userName, fullname, email, phonenumber, dob, password },
  onCreate = undefined
) => {
  const Id = findUserId(userName);
  client.query(
    `insert into user_data values($1, $2, $3, $4, $5, $6, $7)`,
    [Id, fullname, email, phonenumber, password, dob, userName],
    (err, res) => {
      if (err) console.log(err);
      else if (onCreate) onCreate(` New Customer Created Successfully`);
    }
  );
};

const createLoanAccount = async (
  { userName, loanAmount, loanType, loanDuration },
  oncreateLoanAccont = undefined
) => {
  const Id = findUserId(userName);

  const res = await client.query(`select dob from user_data where id=$1`, [Id]);

  const dob = res.rows[0].dob;
  const age = calculate_age(dob);

  const res1 = await client.query(
    `select balance from saving_accounts where id=$1`,
    [Id]
  );
  const res2 = await client.query(
    `select balance from current_accounts where id=$1`,
    [Id]
  );
  const savingBalance = res1.rows[0].balance;
  const currentBalance = res2.rows[0].balance;
  const totalBalance = parseFloat(savingBalance) + parseFloat(currentBalance);
  console.log(totalBalance);
  const maximumLoanAmount = parseFloat(totalBalance * 0.4);
  // console.log(maximumLoanAmount);

  client.query(`select id from user_data where id = $1`, [Id], (err, res) => {
    if (err) {
      console.log(err);
      if (oncreateLoanAccont)
        oncreateLoanAccont(
          "user doesnot exist. please create a saving/current account first"
        );
    } else {
      if (age < 25) {
        if (oncreateLoanAccont)
          oncreateLoanAccont(
            `You have asked loan more than ${maximumLoanAmount}`
          );
      } else if (maximumLoanAmount < loanAmount) {
        oncreateLoanAccont(
          "your age is not enough to get loan, minimium age for loan account is 25 years"
        );
      } else {
        const todayDate = new Date();
        const loanEndDate = addYears(todayDate, loanDuration);
        client.query(
          `insert into loan_accounts values($1,$2,$3,$4,$5)`,
          [Id, loanAmount, loanAmount, loanType, loanEndDate],
          (err, res) => {
            if (err) console.log(err);
            else {
              if (oncreateLoanAccont)
                oncreateLoanAccont(
                  `loan account created with a loan of ${loanAmount} successfully`
                );
            }
          }
        );

        client.query(`update account set is_loan = $1 where id=$2`, [true, Id]);
      }
    }
  });
};

module.exports = {
  createNewAccount,
  createLoanAccount,
  signup,
};
