const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});

client.connect();

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


const secret = process.env.TOKEN_SECRET;

const {findUserId} = require("../utilities/libs")

const validateUser = async(userName,password)=>{
    const Id = findUserId(userName);
    const res = await client.query(`select id, pass_word from user_data where id=$1 and pass_word=$2`,
    [Id,password],)

    const user = res.rows[0];

    if(user){
        user.userName = userName;
        return user;
    }
    else{
        console.log("user not found");
    }
}

const genrateAuthToken = async (user) =>{
    const{id,password,userName} = user;
    const token = await jwt.sign(
        {id,userName},
        secret,
        {
            expiresIn:"1h",        }
    )
    return token;

}



module.exports ={
    genrateAuthToken,
    validateUser
}
