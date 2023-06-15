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

const findEod = async (id, balance, dayToFetch, accountNumber) => {
  let EODbalance = balance;
  let EODsum = 0;
  const res = await client.query(
    `select sum(amount) from transections where id=$1 and date_of_transection=$2 and account_number=$3`,
    [id, dayToFetch]
  );

  if (res.rows[0].sum == null) {
    EODsum = 0;
  } else {
    EODsum = res.rows[0].sum;
  }

  return EODbalance - EODsum;
};

const UserHandlerForNRV = async (Id, balance, accountNumber) => {
  const todayDate = new Date();
  const month = todayDate.getMonth();
  const year = todayDate.getFullYear();

  let sumEod = balance; //30

  for (let i = 13; i >= 12; i--) {
    let dayToFetch = new Date(year, month, i);
    // console.log(await findEod(id, sumEod, dayToFetch))
    const Eod = parseFloat(await findEod(Id, sumEod, dayToFetch));
    sumEod = parseFloat(sumEod) + Eod;
  }

  sumEod = Number(sumEod).toFixed(3);
  console.log(sumEod);

  if (sumEod < 50000000) {
    client.query(
      `select balance from current_accounts where id=$1`,
      [Id],
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(res);
          const newBalance = parseFloat(balance) - 5000;

          client.query(`update current_accounts set balance = $1 where id=$2`, [
            newBalance,
            Id,
          ]);

          const transection_type = "NRV falls below the minimum level";
          const todayDate = new Date();
          const transectionID = uuidv4();
          const TransectionMoney = -5000;
          client.query(
            `insert into transections values($1, $2, $3, $4, $5, $6)`,
            [
              Id,
              TransectionMoney,
              transection_type,
              todayDate,
              transectionID,
              accountNumber,
            ]
          );
        }
      }
    );
  }
};

const currentNRV = async () => {
  const res = await client.query(`select * from current_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let id = res.rows[i].id;
    let balance = res.rows[i].balance;
    let accountNumber = res.rows[i].account_number;
    await UserHandlerForNRV(id, balance, accountNumber);
  }
};

const currentThreeTransactions = async () => {
  const res = await client.query(`select * from current_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let Id = res.rows[i].id;
    let balance = res.rows[i].balance;
    let accountNumber = res.rows[i].account_number;

    let NoOfTransectionsThisMonth = res.rows[i].no_of_transections_this_month;
    await client.query(
      `Update current_accounts set no_of_transections_this_month=$1 where id=$2 and account_balance=$3`,
      [0, Id, accountNumber]
    );

    if (NoOfTransectionsThisMonth < 3) {
      // console.log(res);
      
      const newBalance = parseFloat(balance) - 500;

      client.query(`update current_accounts set balance = $1 where id=$2 and account_balance=$3`, [
        newBalance,
        Id,
        accountNumber
      ]);

      const transection_type =
        "Penalty for less than 3 transections in a month";
      const todayDate = new Date();
      const transectionID = uuidv4();
      const TransectionMoney = -500;
      client.query(`insert into transections values($1, $2, $3, $4, $5, $6)`, [
        Id,
        TransectionMoney,
        transection_type,
        todayDate,
        transectionID,
        accountNumber,
      ]);
    }
  }
};
// currentThreeTransactions()
module.exports = {
  currentNRV,
  currentThreeTransactions,
};
// currentNRV();
