const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

const { v1: uuidv1, v4: uuidv4 } = require("uuid");

client.connect();

const transfer = ({ senderId, reciverId, amount }, onTransfer = undefined) => {
  client.query(
    `select balance from current_accounts where id=$1`,
    [senderId],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(res);
        const balance = parseFloat(res.rows[0].balance);
        console.log(`your balance ${balance}`);
        const newBalance = balance - parseFloat(amount);
        client.query(`update current_accounts set balance = $1 where id=$2`, [
          newBalance,
          senderId,
        ]);

        const transection_type = `Transfered to ${reciverId}`;
        const todayDate = new Date();
        const transectionID = uuidv4();
        client.query(`insert into transections values($1, $2, $3, $4, $5)`, [
          senderId,
          amount,
          transection_type,
          todayDate,
          transectionID,
        ]);
      }
    }
  );

  client.query(
    `select balance from current_accounts where id=$1`,
    [reciverId],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        const balance = parseFloat(res.rows[0].balance);
        console.log(`your balance ${balance}`);
        const newBalance = balance + parseFloat(amount);
        client.query(
          `update current_accounts set balance = $1 where id=$2`,
          [newBalance, reciverId],
          (err, res) => {
            if (err) {
              console.log(`problem in depositing`);
            } else {
              if (onTransfer)
                onTransfer(`Amount ${amount} transfered Successfully`);
            }
          }
        );

        const transection_type = `Recived by ${senderId}`;
        const todayDate = new Date();
        const transectionID = uuidv4();
        client.query(`insert into transections values($1, $2, $3, $4, $5)`, [
          reciverId,
          amount,
          transection_type,
          todayDate,
          transectionID,
        ]);
      }
    }
  );
};

module.exports = {
  transfer,
};
