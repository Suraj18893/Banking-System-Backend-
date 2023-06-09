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

const clientDetails = ({ userName }, onClientDetails = undefined) => {
  const Id = findUserId(userName);
  client.query(
    `select id, fullname, email, phonenumber, dob from user_data where id=$1`,
    [Id],
    (err, res) => {
      if (err) {
        console.log(err);
      } else {
        // const obj = res.rows[0];
        if(onClientDetails) onClientDetails(res.rows[0]);
      }
    }
  );
};

module.exports = {
  clientDetails,
};
