const { Client } = require("pg");
const client = new Client({
  host: "localhost",
  user: "postgres",
  port: "5432",
  password: "inito@123",
  database: "postgres",
});


client.connect((err) => {
  if (err) {
    console.log("Error In Connectivity");
    return;
  }
  console.log("Connected Successfully");
});

const { createNewAccount, createLoanAccount } = require("./services/createService");
const {  deposit, withdraw} = require("./services/transectionServices");
const {transfer} = require("./services/transeferService");
const {fetchPassbook} = require("./services/fetchPassBook");
const {clientDetails} = require("./services/clientDetailsServie");
const {signup} = require("./services/createService");

/*
for testing perpose
createNewAccount({
  "userName" : "allia",
  "fullname" : "alia kumari",
  "email" : "alia123@mail.com",
  "phonenumber" : "988923466",
  "dob" : "2000-12-1",
  "password" : "inito@22",
  "isSaving" : true,
  "isCurrent" : true,
  "isLoan" : false,
  "savingBalance" : 22270,
  "currentBalance" : 1000000
})
*/



// withdraw({
//   "Id": 8703,
//   "amount": 70,
//   "password": "inito@122",
//   "accountType": "current",
// });



// deposit({
//   "Id": 8703,
//   "amount": 70,
//   "password": "inito@122",
//   "accountType": "saving",
// });


// transfer({ senderId: 8703, reciverId:57597, amount: 7000, senderPassword:"inito@122"});

// fetchPassbook({Id:8703, password:"inito@122"});


// clientDetails({Id:4728827, password:"inito@22"});

// createLoanAccont({userName:"praful", password:"inito@122", loanAmount: 2000000, loanType:"Home Loan", loanDuration:"2"});




module.exports = {
  createNewAccount,
  deposit,
  withdraw,
  transfer,
  clientDetails,
  fetchPassbook,
  signup,
  createLoanAccount,
};
