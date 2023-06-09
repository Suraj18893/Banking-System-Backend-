const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();



const updateIntrest = async (id, balance, dayToFetch) => {
  let EODbalance = balance;
  let EODsum = 0;
  const res = await client.query(
    `select sum(amount) from transections where id=$1 and date_of_transection=$2`,
    [id, dayToFetch]
  );

  if (res.rows[0].sum == null) {
    EODsum = 0;
  }
  else{
    EODsum = res.rows[0].sum;
  }

  console.log(EODsum);

  //   EODbalance = EODbalance-(EODsum);

  //   console.log(res);
};
const UserHandler = async (id, balance) => {
  const todayDate = new Date();
  const month = todayDate.getMonth();
  const year = todayDate.getFullYear();

  let dayToFetch = new Date(year, month, 13);
  updateIntrest(id, balance, dayToFetch);

  // const res = await client.query(`select `)
};
const savingIntrest = async () => {
  const res = await client.query(`select * from saving_accounts`);
  let n = res.rows.length;
  for (let i = 0; i < n; i++) {
    let id = res.rows[i].id;
    let balance = res.rows[i].balance;
    UserHandler(id, balance); //30 jan 2023
  }
};
// savingIntrest();
UserHandler(4229070, 187600);
// const todayDate = new Date();
// updateIntrest(4229070,187600,todayDate)
