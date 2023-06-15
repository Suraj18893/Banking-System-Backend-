const app = require("./../../app");
const jwt = require("jsonwebtoken");
const {
  validateUser,
  genrateAuthToken,
} = require("../../services/authService");
const dotenv = require("dotenv").config({ path: "./../../env" });
const {
  signup,
  createNewAccount,
  createLoanAccount,
} = require("../../services/createService.js");
const { Client } = require("pg");
const supertest = require("supertest");
const { withdraw, deposit } = require("../../services/transectionServices");

const HOST = process.env.HOST;
const USER = process.env.USER;
const PORT = process.env.PORT;
const PASSWORD = process.env.PASSWORD;
const DATABASE = process.env.DATABASE;
const SECRET = process.env.TOKEN_SECRET;

const client = new Client({
  host: HOST,
  user: USER,
  port: PORT,
  password: PASSWORD,
  database: DATABASE,
});

describe("loan services", () => {

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

  afterAll(async () => {
    client.end();
  });

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

  it("should create savings account", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isSaving: true,
      savingBalance: 1000000,
    });
    expect(res.message).toBe("account created successfully");
    expect(res.account_Number).not.toBeNull();
  });

  it("should create savings account", async () => {
    const res = await createNewAccount({
      userName: "sooraj",
      isSaving: true,
      savingBalance: 1000000,
    });
    expect(res.message).toBe("account created successfully");
    expect(res.account_Number).not.toBeNull();
  });

  it("should create current account", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isCurrent: true,
      currentBalance: 1000000,
    });
    expect(res.message).toBe("account created successfully");
    expect(res.account_Number).not.toBeNull();
  });

  it("should create loan account", async () => {
    const res = await createLoanAccount({
      userName: "suraj",
      loanAmount: 500000,
      loanType: "Home loan",
      loanDuration: 3,
    });
    expect(res.message).toBe("user loan account created successfully");
    loanAccountNumber = res.loanAccountNumber; 
  });

  it("should not create loan account, age not satisfied", async () => {
    const res = await createLoanAccount({
      userName: "sooraj",
      loanAmount: 500000,
      loanType: "Home loan",
      loanDuration: 3,
    });
    expect(res.message).toBe("Loan account cannot be created as the age is less than 25");
  });

  it("should not create loan account, age not satisfied", async () => {
    const res = await createLoanAccount({
      userName: "suraj",
      loanAmount: 499999,
      loanType: "Home loan",
      loanDuration: 3,
    });
    expect(res.message).toBe("please check amount, loan amount should be more than 500000");

  });
  it("should not create loan account, not 24 months", async () => {
    const res = await createLoanAccount({
      userName: "suraj",
      loanAmount: 500000,
      loanType: "Home loan",
      loanDuration: 1,
    });
    expect(res.message).toBe("please check loan duration, loan duration should be at least 2 years");

  });

  it("should deposit to loan account", async () => {
    const res = await deposit({
      userName: "suraj",
      amount: 5000,
      accountType: "loan",
      accountNumber: loanAccountNumber,
    });
    expect(res.message).toBe("money deposited successfully to your loan account");
  });

  it("should not deposit to loan account, greater than 10%", async () => {
    const res = await deposit({
      userName: "suraj",
      amount: 100000,
      accountType: "loan",
      accountNumber: loanAccountNumber,
    });
    expect(res.message).toBe("cannot be deposited as it is exceding maximum depositing amount");
  });
});
