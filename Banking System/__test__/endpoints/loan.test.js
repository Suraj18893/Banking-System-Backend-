const app = require("./../../app");
const supertest = require("supertest");
const {
  validateUser,
  genrateAuthToken,
} = require("../../services/authService");

const { Client } = require("pg");

const dotenv = require("dotenv").config({ path: "./../../env" });

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

describe("Loan account Endpoints", () => {
  let tokenA;
  let tokenB;
  let loanAccountNumber;

  beforeAll(async () => {
    client.connect();
    await client.query(`delete from account`);
    await client.query(`delete from user_data`);
    await client.query(`delete from saving_accounts`);
    await client.query(`delete from current_accounts`);
    await client.query(`delete from loan_accounts`);
    await client.query(`delete from transections`);
  });

  afterAll(async ()=>{
    client.end();
  })

  it("should create account", async () => {
    let res = await supertest(app).post("/signup").send({
      userName: "suraj",
      fullname: "sur",
      email: "suraj@gmail.com",
      phonenumber: "7906753094",
      dob: "1988-8-28",
      password: "inito@22",
    });

    expect(res.body.message.message).toMatch("New User Created Successfully");
  });

  it("should login", async () => {
    let res = await supertest(app).post("/login").send({
      userName: "suraj",
      password: "inito@22",
    });
    tokenB = res.text;
    expect(tokenB).not.toBeNull();
  });

  it("should create account", async () => {
    let res = await supertest(app).post("/signup").send({
      userName: "sooraj",
      fullname: "sur",
      email: "suraj@gmail.com",
      phonenumber: "7906753094",
      dob: "2000-8-28",
      password: "inito@22",
    });

    expect(res.body.message.message).toMatch("New User Created Successfully");
  });

  it("should login", async () => {
    let res = await supertest(app).post("/login").send({
      userName: "sooraj",
      password: "inito@22",
    });
    tokenA = res.text;
    expect(tokenA).not.toBeNull();
  });


  it("should not create a loan account, minimum age not satisfied", async () => {
    let res = await supertest(app)
      .post("/createloan")
      .send({
        userName: "sooraj",
        loanAmount: 1000000,
        loanType: "Home Loan",
        loanDuration: 3,
      })
      .set("authorization", `Bearer ${tokenA}`);
    expect(res.body).toMatch(
      "Loan account cannot be created as the age is less than 25"
    );
  });
  it("should not create a loan account, minimum amount not satisfied", async () => {
    let res = await supertest(app)
      .post("/createloan")
      .send({
        userName: "suraj",
        loanAmount: 1000,
        loanType: "Home Loan",
        loanDuration: 3,
      })
      .set("authorization", `Bearer ${tokenB}`);
    expect(res.body.message).toMatch(
      "please check amount or duration, loan amount should be more than 500000 and loan duration should be minimum 2 years"
    );
  });
  it("should not create a loan account, no current & savings account associated", async () => {
    let res = await supertest(app)
      .post("/createloan")
      .send({
        userName: "suraj",
        loanAmount: 10000000,
        loanType: "Home Loan",
        loanDuration: 3,
      })
      .set("authorization", `Bearer ${tokenB}`);
    expect(res.body.message).toMatch(
      "user doesnot exist. please create a saving/current account first"
    );
  });
  it("should not create a loan account, insufficent balance in current & savings", async () => {
    await supertest(app)
      .post("/create")
      .send({
        userName: "suraj",
        isCurrent: true,
        currentBalance: 100000,
      })
      .set("authorization", `Bearer ${tokenB}`);
    let res = await supertest(app)
      .post("/createloan")
      .send({
        userName: "suraj",
        loanAmount: 10000000,
        loanType: "Home Loan",
        loanDuration: 3,
      })
      .set("authorization", `Bearer ${tokenB}`);
    console.log(res.body.message);
    expect(res.body.message).toMatch(
      "Insufficent balance in current & savings"
    );
  });
  it("should create a loan account, all conditions satisfied", async () => {
    await supertest(app)
      .post("/create")
      .send({
        userName: "suraj",
        isSaving: true,
        savingBalance: 10000000,
      })
      .set("authorization", `Bearer ${tokenB}`);
    let res = await supertest(app)
      .post("/createloan")
      .send({
        userName: "suraj",
        loanAmount: 500000,
        loanType: "Home Loan",
        loanDuration: 3,
      })
      .set("authorization", `Bearer ${tokenB}`);
      loanAccountNumber = res.body.loanAccountNumber
    expect(res.body.message).toMatch(
      "user loan account created successfully"
    );
  });
  // userName, amount, accountType, accountNumber
  it("should not deposit amount, greater than 10% of loan amount", async () => {
    let res = await supertest(app)
      .put("/deposit")
      .send({
        userName: "suraj",
        amount: 100000,
        accountType: "loan",
        accountNumber: loanAccountNumber,
      })
      .set("authorization", `Bearer ${tokenB}`);
    expect(res.body.msg).toMatch(
      "cannot be deposited as it is exceding maximum depositing amount"
    );
  });
  it("should deposit amount to loan account", async () => {
    let res = await supertest(app)
      .put("/deposit")
      .send({
        userName: "suraj",
        amount: 50000,
        accountType: "loan",
        accountNumber: loanAccountNumber,
      })
      .set("authorization", `Bearer ${tokenB}`);
    expect(res.body.msg).toMatch(
      "money deposited successfully to your loan account"
    );
  });
  
});
