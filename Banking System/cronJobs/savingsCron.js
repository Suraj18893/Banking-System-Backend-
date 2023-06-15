const { Client } = require("pg");
const dotenv = require("dotenv").config({ path: "../.env" });
// dotenv.config();

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

  return EODbalance - EODsum;
};

const UserHandlerForIntrest = async (Id, balance, accountNumber) => {
  const todayDate = new Date();
  const month = todayDate.getMonth();
  const year = todayDate.getFullYear();

  let sumEod = balance; //30

  for (let i = 13; i >= 12; i--) {
    let dayToFetch = new Date(year, month, i);
    // console.log(await findEod(id, sumEod, dayToFetch))
    const Eod = parseFloat(await findEod(Id, sumEod, dayToFetch, accountNumber));
    sumEod = parseFloat(sumEod) + Eod;
  }

  let intrestToCredit = (sumEod / 30) * (0.5 / 100);
  intrestToCredit = Number(intrestToCredit).toFixed(3);


  client.query(
    `select balance from saving_accounts where id=$1`,
    [Id],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        const newBalance = parseFloat(balance) + parseFloat(intrestToCredit);
        client.query(`update saving_accounts set balance = $1 where id=$2 and account_number=$3`, [
          newBalance,
          Id,
          accountNumber
        ]);

        const transection_type = `Intrest credited of INR ${intrestToCredit}`;
        const todayDate = new Date();
        const transectionID = uuidv4();
        client.query(`insert into transections values($1, $2, $3, $4, $5, $6)`, [
          Id,
          intrestToCredit,
          transection_type,
          todayDate,
          transectionID,
          accountNumber,
        ]);
      }
    }
  );
};

const UserHandlerForNRV = async (Id, balance, accountNumber) => {
  const todayDate = new Date();
  const month = todayDate.getMonth();
  const year = todayDate.getFullYear();

  let sumEod = balance; //30

  for (let i = 13; i >= 12; i--) {
    let dayToFetch = new Date(year, month, i);
    // console.log(await findEod(id, sumEod, dayToFetch))
    const Eod = parseFloat(await findEod(Id, sumEod, dayToFetch, accountNumber));
    sumEod = parseFloat(sumEod) + Eod;
  }

  if (sumEod < 100000) {
    client.query(
      `select balance from saving_accounts where id=$1`,
      [Id],
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          const newBalance = parseFloat(balance) - 1000;
          client.query(
            `update saving_accounts set balance = $1 where id=$2 and account_number=$3`,
            [newBalance, Id, accountNumber]
          );

          const transection_type = `NRV falls below the minimum level`;

          const todayDate = new Date();
          const transectionID = uuidv4();
          client.query(`insert into transections values($1, $2, $3, $4, $5, $6)`, [
            Id,
            -1000,
            transection_type,
            todayDate,
            transectionID,
            accountNumber
          ]);
        }
      }
    );
  }
};

const savingIntrest = async () => {
  const res = await client.query(`select * from saving_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let id = res.rows[i].id;
    let balance = res.rows[i].balance;
    let accountNumber = res.rows[i].account_number;
    await UserHandlerForIntrest(id, balance, accountNumber); //30 jan 2023
    // console.log(`${id} and ${balance}`)
  }
};

const savingNRV = async () => {
  const res = await client.query(`select * from saving_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let id = res.rows[i].id;
    let balance = res.rows[i].balance;
    let accountNumber = res.rows[i].account_number;
    await UserHandlerForNRV(id, balance, accountNumber);
  }
};

const savingAtmTransections = async () => {
  client.query(`update saving_accounts set no_atm_transections_per_month=0`);
};

module.exports = {
  savingIntrest,
  savingNRV,
  savingAtmTransections,
};

savingNRV();
// UserHandler(1343996, 10000);
// const todayDate = new Date();
// updateIntrest(4229070,187600,todayDate)
