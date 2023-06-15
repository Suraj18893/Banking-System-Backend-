const app = require("./../../app");
const jwt = require("jsonwebtoken");
const {
  validateUser,
  genrateAuthToken,
} = require("../../services/authService");
const dotenv = require("dotenv").config({ path: "./../../env" });
const { signup, createNewAccount } = require("../../services/createService.js");
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

describe("savings services", () => {
  let accountNumber;
  let atmCardNumber;
  let cvvNumber;
  let expiryDate;

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

  it("should create savings account", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isSaving: true,
      savingBalance: 100000,
    });
    expect(res.message).toBe("account created successfully");
    expect(res.account_Number).not.toBeNull();
    accountNumber = res.account_Number;
    atmCardNumber = res.atmCardNumber;
    cvvNumber = res.cvvNumber;
    expiryDate = res.expiryDate;
  });

  it("should mot create savings account, opening balance not satisfied", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isSaving: true,
      savingBalance: 100,
    });
    expect(res.message).toBe("Saving Balance should be minimun 10,000 INR, ");
    expect(res.account_Number).toBe(undefined);
  });

  it("should withdraw from savings account", async () => {
    const res = await withdraw({
      userName: "suraj",
      amount: 30000,
      accountType: "saving",
      accountNumber: accountNumber,
    });
    expect(res.message).toBe(`Amount 30000 Withdraw Successfully`);
  });
  it("should not withdraw from savings account, one time limit reached", async () => {
    const res = await withdraw({
      userName: "suraj",
      amount: 30000,
      accountType: "saving",
      accountNumber: accountNumber,
    });
    expect(res.message).toBe("Daily transection limit of 50,000 INR reached");
  });
  it("should withdraw from savings account, 5*ATM, no atm charges", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await withdraw({
        userName: "suraj",
        amount: 300,
        accountType: "saving",
        accountNumber: accountNumber,
        IsAtm: true,
        atmCardNumber: atmCardNumber,
        cvvNumber: cvvNumber,
        expiryDate,
      });
      expect(res.message).toBe(`Amount 300 Withdraw Successfully`);
    }
  });
  it("should withdraw from savings account, > 5, with atm charges", async () => {
    const res = await withdraw({
      userName: "suraj",
      amount: 300,
      accountType: "saving",
      accountNumber: accountNumber,
      IsAtm: true,
      atmCardNumber: atmCardNumber,
      cvvNumber: cvvNumber,
      expiryDate,
    });
    expect(res.message).toBe(
      `Amount 300 Withdraw Successfully and 500 INR debited because you have cross the limit of maximum ATM transections`
    );
  });
});
