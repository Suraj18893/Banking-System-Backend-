const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();

const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const { formatDate, findUserId } = require("../utilities/libs");

const withdraw = (
  { userName, amount, accountType, IsAtm = false },
  onWithdraw = undefined
) => {
  const Id = findUserId(userName);
  if (accountType == "saving") {
    const currentDate = Date(Date.now()).toString();
    const formattedDate = formatDate(currentDate);
    console.log(formattedDate);
    const transectionType1 = "withdrawn from savings";
    const transectionType2 = "withdrawn from savings by ATM";
    client.query(
      `select sum(amount) from transections where id=$1 and Date(date_of_transection)=$2 and (transection_type=$3 or transection_type=$4)`,
      [Id, formattedDate, transectionType1, transectionType2],
      (err, res) => {
        const sumOfAmount = res.rows[0].sum;
        if (sumOfAmount > 50000) {
          if (onWithdraw)
            onWithdraw("Daily transection limit of 50,000 INR reached");
        } else {
          if (IsAtm) {
            client.query(
              `select balance, no_atm_transections_per_month from saving_accounts where id=$1`,
              [Id],
              (err, res) => {
                const noAtmTransectionsPerMonth =
                  res.rows[0].no_atm_transections_per_month;
                if (noAtmTransectionsPerMonth >= 5) {
                  const balance = parseFloat(res.rows[0].balance);
                  console.log(`your balance ${balance}`);
                  const newBalance = balance - parseFloat(amount) - 500;
                  const newNoAtmTransectionsPerMonth =
                    noAtmTransectionsPerMonth + 1;
                  client.query(
                    `update saving_accounts set balance = $1 , no_atm_transections_per_month=$2 where id=$3`,
                    [newBalance, newNoAtmTransectionsPerMonth, Id],
                    (err, res) => {
                      if (err) {
                        console.log(`problem in withdraw`);
                      } else {
                        if (onWithdraw)
                          onWithdraw(
                            `Amount ${amount} Withdraw Successfully and 500 INR debited because you have cross the limit of maximum ATM transections`
                          );
                        console.log(`Amount ${amount} withdrawn`);
                      }
                    }
                  );
                } else {
                  const balance = parseFloat(res.rows[0].balance);
                  console.log(`your balance ${balance}`);
                  const newBalance = balance - parseFloat(amount);
                  const newNoAtmTransectionsPerMonth =
                    noAtmTransectionsPerMonth + 1;
                  client.query(
                    `update saving_accounts set balance = $1 , no_atm_transections_per_month=$2 where id=$3`,
                    [newBalance, newNoAtmTransectionsPerMonth, Id],
                    (err, res) => {
                      if (err) {
                        console.log(`problem in withdraw`);
                      } else {
                        if (onWithdraw)
                          onWithdraw(`Amount ${amount} Withdraw Successfully`);
                        console.log(`Amount ${amount} withdrawn`);
                      }
                    }
                  );
                }
                const transection_type = "withdrawn from savings by ATM";
                const todayDate = new Date();
                const transectionID = uuidv4();
                client.query(
                  `insert into transections values($1, $2, $3, $4, $5)`,
                  [Id, amount, transection_type, todayDate, transectionID]
                );
              }
            );
          } else {
            client.query(
              `select balance from saving_accounts where id=$1`,
              [Id],
              (err, res) => {
                if (err) {
                  console.log(err);
                } else {
                  // console.log(res);
                  const balance = parseFloat(res.rows[0].balance);
                  console.log(`your balance ${balance}`);
                  const newBalance = balance - parseFloat(amount);
                  client.query(
                    `update saving_accounts set balance = $1 where id=$2`,
                    [newBalance, Id],
                    (err, res) => {
                      if (err) {
                        console.log(`problem in withdraw`);
                      } else {
                        if (onWithdraw)
                          onWithdraw(`Amount ${amount} Withdraw Successfully`);
                        console.log(`Amount ${amount} withdrawn`);
                      }
                    }
                  );

                  const transection_type = "withdrawn from savings";
                  const todayDate = new Date();
                  const transectionID = uuidv4();
                  client.query(
                    `insert into transections values($1, $2, $3, $4, $5)`,
                    [Id, amount, transection_type, todayDate, transectionID]
                  );
                }
              }
            );
          }
        }
      }
    );
  } else if (accountType == "current") {
    client.query(
      `select balance, no_of_transections_this_month from current_accounts where id=$1`,
      [Id],
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          // console.log(res);
          const NoOfTransectionsThisMonth =
            res.rows[0].no_of_transections_this_month;
          const NewNoOfTransectionsThisMonth = NoOfTransectionsThisMonth + 1;
          const transectionCharge = Math.min(500, amount * (0.5 / 100));
          const balance = parseFloat(res.rows[0].balance);
          console.log(transectionCharge);
          console.log(`your balance ${balance}`);
          const newBalance =
            balance - parseFloat(amount) - parseFloat(transectionCharge);

          client.query(
            `update current_accounts set balance = $1, no_of_transections_this_month=$2 where id=$3`,
            [newBalance, NewNoOfTransectionsThisMonth, Id],
            (err, res) => {
              if (err) {
                console.log(`problem in withdraw`);
              } else {
                if (onWithdraw)
                  onWithdraw(`Amount ${amount} Withdraw Successfully`);
                console.log(`Amount ${amount} withdrawn`);
              }
            }
          );

          const transection_type = "withdrawn from current";
          const todayDate = new Date();
          const transectionID = uuidv4();
          client.query(`insert into transections values($1, $2, $3, $4, $5)`, [
            Id,
            amount,
            transection_type,
            todayDate,
            transectionID,
          ]);
        }
      }
    );
  }
};

const deposit = async (
  { userName, amount, accountType },
  onDeposit = undefined
) => {
  const Id = findUserId(userName);
  if (accountType == "saving") {
    client.query(
      `select balance from saving_accounts where id=$1`,
      [Id],
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          const balance = parseFloat(res.rows[0].balance);
          console.log(`your balance ${balance}`);
          const newBalance = balance + parseFloat(amount);
          client.query(
            `update saving_accounts set balance = $1 where id=$2`,
            [newBalance, Id],
            (err, res) => {
              if (err) {
                console.log(err);
              } else {
                if (onDeposit)
                  onDeposit(`Amount ${amount} deposited Successfully`);
              }
            }
          );

          const transection_type = "deposited to savings";
          const todayDate = new Date();
          const transectionID = uuidv4();
          client.query(`insert into transections values($1, $2, $3, $4, $5)`, [
            Id,
            amount,
            transection_type,
            todayDate,
            transectionID,
          ]);
        }
      }
    );
  } else if (accountType == "current") {
    client.query(
      `select balance, no_of_transections_this_month from current_accounts where id=$1`,
      [Id],
      (err, res) => {
        if (err) {
          console.log(err);
        } else {
          const transectionCharge = Math.min(500, amount * (0.5 / 100));
          const balance = parseFloat(res.rows[0].balance);
          const NoOfTransectionsThisMonth =
            res.rows[0].no_of_transections_this_month;
          const NewNoOfTransectionsThisMonth = NoOfTransectionsThisMonth + 1;
          console.log(NewNoOfTransectionsThisMonth);

          console.log(`your balance ${balance}`);
          const newBalance = balance + parseFloat(amount) - transectionCharge;
          client.query(
            `update current_accounts set balance = $1, no_of_transections_this_month=$2 where id=$3`,
            [newBalance, NewNoOfTransectionsThisMonth, Id],
            (err, res) => {
              if (err) {
                console.log(`problem in depositing`);
              } else {
                if (onDeposit)
                  onDeposit(`Amount ${amount} deposited Successfully`);
              }
            }
          );

          const transection_type = "deposited to current";
          const todayDate = new Date();
          const transectionID = uuidv4();
          client.query(`insert into transections values($1, $2, $3, $4, $5)`, [
            Id,
            amount,
            transection_type,
            todayDate,
            transectionID,
          ]);
        }
      }
    );
  } else if (accountType == "loan") {
    const res = await client.query(
      `select loan_amount from loan_accounts where id=$1`,
      [Id]
    );
    const loanAmount = res.rows[0].loan_amount;
    if (loanAmount * 0.1 < amount) {
      if (onDeposit)
        onDeposit(
          `${amount} cannot be deposited as it is exceding maximum depositing amount ${
            loanAmount * 0.1
          }`
        );
    } else {
      client.query(
        `select loan_balance from loan_accounts where id=$1`,
        [Id],
        (err, res) => {
          if (err) console.log(err);
          else {
            const loanBalance = parseFloat(res.rows[0].loan_balance);
            const newLoanBalance = loanBalance - parseFloat(amount);
            client.query(
              `update loan_accounts set loan_balance=$1 where id=$2`,
              [newLoanBalance, Id],
              (err, res) => {
                if (err) console.log(err);
                else {
                  if (onDeposit)
                    onDeposit(
                      `${amount} INR deposited successfully to your loan account`
                    );
                }
              }
            );

            const transection_type = "deposited to loan";
            const todayDate = new Date();
            const transectionID = uuidv4();
            client.query(
              `insert into transections values($1, $2, $3, $4, $5)`,
              [Id, amount, transection_type, todayDate, transectionID]
            );
          }
        }
      );
    }
  }
};

module.exports = {
  deposit,
  withdraw,
};
