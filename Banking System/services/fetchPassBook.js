const { Client } = require("pg");
const { findUserId } = require("../utilities/libs");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();


const fetchPassbook = ({ userName }, onfetchPassbook = undefined) => {
  const Id = findUserId(userName)
  client.query(
    `select id, amount, transection_type, date_of_transection, transection_id from transections where id=$1`,
    [Id],
    (err, res) => {
      if (err) console.log(err);
      else {
        //   console.log(res.rows);
        if (onfetchPassbook) onfetchPassbook(res.rows);
      }
    }
  );
};

module.exports = {
  fetchPassbook,
};
