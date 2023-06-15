const { response } = require("express");
const express = require("express");
const { emptyQuery } = require("pg-protocol/dist/messages");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();

// -----------DB connection--------------
const { Client } = require("pg");
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
client.connect((err) => {
if (err) {
    console.log("Error In Connectivity");
    return;
  }
  console.log("Connected Successfully");
});
// ------------------------------------



const app = express();
app.use(express.json());

const port = 3000;
const {
  creatnewacc,
  fetchPassbookDetails,
  fetchClientDetails,
  signUpclient,
  createloan,
} = require("./controller/accountController");
const { transferMoney } = require("./controller/transferController");
const {
  withdrawMoney,
  depositMoney,
} = require("./controller/transectionController");
const { validateUser } = require("./services/authService");
const { genrateAuthToken } = require("./services/authService");
const authMiddleware = require("./middleware/authMiddleware");
const {
  savingIntrest,
  savingNRV,
  savingAtmTransections,
} = require("./cronJobs/savingsCron");
const {
  currentNRV,
  currentThreeTransactions,
} = require("./cronJobs/currentCron");
const { loanIntrest } = require("./cronJobs/loanCron");
app.use(express.json());
app.post("/create", authMiddleware, creatnewacc);
app.post("/signup", express.json(), signUpclient);
app.put("/transfer", authMiddleware, transferMoney);
app.put("/withdraw", authMiddleware, withdrawMoney);
app.put("/deposit", authMiddleware, depositMoney);
app.get("/passbook", authMiddleware, fetchPassbookDetails);
app.get("/clientdetails", authMiddleware, fetchClientDetails);
app.post("/createloan", authMiddleware, createloan);

app.post("/login", express.json(), async (req, res) => {
  try {
    const userName = req.body.userName;
    const password = req.body.password;
    const user = await validateUser(userName, password);

    if (!user) {
      res.send({
        message: "invalid credentials please check userName or Password",
      });
    } else {
      const token = await genrateAuthToken(user);
      res.send(token);
    }
  } catch (error) {
    console.log(error);
  }
});

// app.listen(port, () => {
//   console.log(`listening on ${port}`);
// });

module.exports = app;
// cron.schedule('*/10 * * * * *' , ()=>{
//     console.log("cron is running");
// });

// cron for saving;
// cron.schedule('1 * * * * *' , savingIntrest);
// cron.schedule('1 * * * * *' , savingNRV);
// cron.schedule('1 * * * * *' , savingAtmTransections);

// cron for current;
// cron.schedule('1 * * * * *' , currentNRV);
// cron.schedule('1 * * * * *' , currentThreeTransactions);

// cron for loan;
// cron.schedule('1 * * * * *' , loanIntrest);
