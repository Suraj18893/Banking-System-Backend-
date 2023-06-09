const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();

const fetchAccount = ({Id, password}, onfetchAccount=undefined)=>{
    client.query(`select id, password from user_data where id=$1 and pass_word=$2`)
    
}