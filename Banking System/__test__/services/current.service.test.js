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

describe("current services", () => {
  let accountNumber;

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
      dob: "2006-8-28",
      password: "inito@22",
    });

    expect(res.body.message.message).toMatch("New User Created Successfully");
  });

  it("should create current account", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isCurrent: true,
      currentBalance: 100000,
    });
    expect(res.message).toBe("account created successfully");
    expect(res.account_Number).not.toBeNull();
    accountNumber = res.account_Number;
  });

  it("should not create current account, opening balance not satisfied", async () => {
    const res = await createNewAccount({
      userName: "suraj",
      isCurrent: true,
      currentBalance: 1000,
    });
    expect(res.message).toBe(
      "please check Current Balance should be minimun 100,000 INR, "
    );
    expect(res.account_Number).toBe(undefined);
  });
  it("should not create current account, minimum age not satisfied", async () => {
    const res = await createNewAccount({
      userName: "sooraj",
      isCurrent: true,
      currentBalance: 1000,
    });
    expect(res.message).toBe(
      "current account cannot be created as the age is less than 18"
    );
  });

  it("should withdraw from current account", async () => {
    const res = await withdraw({
      userName: "suraj",
      amount: 10000,
      accountType: "current",
      accountNumber: accountNumber,
    });
    expect(res.message).toBe("Amount 10000 Withdraw Successfully");
  });

  it("should not withdraw from current account, insuffucient balance", async () => {
    const res = await withdraw({
      userName: "suraj",
      amount: 200000,
      accountType: "current",
      accountNumber: accountNumber,
    });
    expect(res.message).toBe(
      "200000 cannot be withdrawn as you don't have enough balance"
    );
});

it("should deposit to current account", async () => {
    const res = await deposit({
        userName: "suraj",
        amount: 200000,
        accountType: "current",
        accountNumber: accountNumber,
    });
    expect(res.message).toBe(
      "Amount 200000 deposited Successfully"
    );
  });
});
