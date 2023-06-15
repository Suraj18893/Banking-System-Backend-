const { Client } = require("pg");
const dotenv = require("dotenv").config({ path: "../.env" });

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

const { v1: uuidv1, v4: uuidv4 } = require("uuid");
const { addYears, monthDiff } = require("../utilities/libs");

const findEod = async (id, balance, dayToFetch, accountNumber) => {
  let EODbalance = balance;
  let EODsum = 0;
  const res = await client.query(
    `select sum(amount) from transections where id=$1 and date_of_transection=$2 and account_number=$3`,
    [id, dayToFetch, accountNumber]
  );

  if (res.rows[0].sum == null) {
    EODsum = 0;
  } else {
    EODsum = res.rows[0].sum;
  }

  return EODbalance + EODsum;
};

const userHandlerLoan = async (
  Id,
  loanBalance,
  loanType,
  loanAccountNumber
) => {
  const todayDate = new Date();
  const month = todayDate.getMonth();
  const year = todayDate.getFullYear();

  let sumOfEodAfter6Months = parseFloat(loanBalance); //30

  for (let i = 30; i > 1; i--) {
    for (let j = month; j >= month - 6; j--) {
      let dayToFetch = new Date(year, month, i);
      const Eod = parseFloat(
        await findEod(Id, sumOfEodAfter6Months, dayToFetch, loanAccountNumber)
      );
      sumOfEodAfter6Months = parseFloat(sumOfEodAfter6Months) + Eod;
    }
  }

  let TransectionMoney = 0;
  let newLoanBalance = 0;
  if (loanType == "Home Loan") {
    newLoanBalance =
      parseFloat(loanBalance) + sumOfEodAfter6Months * ((7/2)/ 100);
    TransectionMoney = Amount * ((7/2)/ 100);
  } else if (loanType == "Car Loan") {
    newLoanBalance =
      parseFloat(loanBalance) + sumOfEodAfter6Months * ((8/2)/ 100);
    TransectionMoney = Amount * ((8/2)/ 100);
  } else if (loanType == "Personal Loan") {
    newLoanBalance =
      parseFloat(loanBalance) + sumOfEodAfter6Months * ((12/2)/ 100);
    TransectionMoney = Amount * ((12/2)/ 100);
  } else if (loanType == "Business Loan") {
    newLoanBalance =
      parseFloat(loanBalance) + sumOfEodAfter6Months * ((15/2)/ 100);
    TransectionMoney = Amount * ((15/2)/100);
  }

  client.query(
    `update loan_accounts set loan_balance = $1 where id=$2 and account_number=$3`,
    [newLoanBalance, Id, loanAccountNumber]
  );

  const transection_type = "Loan intrest debited";
  const transectionID = uuidv4();

  client.query(`insert into transections values($1, $2, $3, $4, $5, $6)`, [
    Id,
    TransectionMoney,
    transection_type,
    todayDate,
    transectionID,
    loanAccountNumber,
  ]);
};

const loanIntrest = async () => {
  const res = await client.query(`select * from loan_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let id = res.rows[i].id;
    let loanBalance = res.rows[i].loan_balance;
    let loanAccountNumber = res.rows[i].account_number;
    let loanStartDate = res.rows[i].loan_start_date;
    let loanEndDate = res.rows[i].loan_end_date;
    let todayDate = new Date();
    let loanType = res.rows[i].loan_type;

    if ((monthDiff(loanStartDate, todayDate) - 1) % 6 == 0) {
      userHandlerLoan(id, loanBalance, loanType, loanAccountNumber);
    }
  }
};

module.exports = {
  loanIntrest,
};

// loanIntrest();
