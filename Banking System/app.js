const { response } = require("express");
const express = require("express");
const { emptyQuery } = require("pg-protocol/dist/messages");
const cron= require('node-cron')


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
const { transferMoney } = require("./controller/transeferController");
const {
  withdrawMoney,
  depositMoney,
} = require("./controller/transectionController");
const { validateUser } = require("./services/authService");
const {genrateAuthToken} = require("./services/authService");
const authMiddleware = require("./middleware/authMiddleware");
app.use(express.json());
app.post("/create", authMiddleware, creatnewacc);
app.post("/signup", express.json(), signUpclient);
app.post("/transfer", authMiddleware, transferMoney);
app.post("/withdraw", authMiddleware, withdrawMoney);
app.post("/deposit", authMiddleware, depositMoney);
app.post("/passbook",authMiddleware, fetchPassbookDetails);
app.post("/clientdetails", authMiddleware, fetchClientDetails);
app.post("/createloan", authMiddleware, createloan);

app.post("/login",express.json(), async (req, res) => {
  try {
    const userName = req.body.userName;
    const password = req.body.password;
    const user = await validateUser(userName, password);

    console.log(`${user} from auth file`);
    if(!user){
        res.status(400).send({
            sign_in_error : "invalid credentials"
        })
    }
    else{
        const token = await genrateAuthToken(user);
        res.send(token);
    }
  } catch (error){
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

cron.schedule('*/10 * * * * *' , ()=>{
    console.log("cron is running");
});

