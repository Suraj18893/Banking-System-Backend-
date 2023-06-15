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



describe("Savings account endpoints", () => {
  let token;
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
    token = res.text;
    expect(token).not.toBeNull();
  });

  it("should create a currents account, minimum amount not satisfied", async () => {
    let res = await supertest(app)
      .post("/create")
      .send({
        userName: "suraj",
        isCurrent: "true",
        currentBalance: "300",
      })
      .set("authorization", `Bearer ${token}`);
    expect(res.body.message).toMatch(
      "please check Current Balance should be minimun 100,000 INR, "
    );
  });
  it("should currents account, with auth token", async () => {
    let res = await supertest(app)
      .post("/create")
      .send({
        userName: "suraj",
        isCurrent: "true",
        currentBalance: "1000000",
      })
      .set("authorization", `Bearer ${token}`);
    expect(res.body.message).toMatch("account created successfully");
    expect(res.body.account_Number).not.toBeNull();
    accountNumber = res.body.account_Number;
  });
  it("should deposit amount to currents account", async () => {
    const amountToDeposit = 100000;
    let res = await supertest(app)
      .put("/deposit")
      .send({
        userName: "suraj",
        amount: amountToDeposit,
        accountType: "current",
        accountNumber: accountNumber,
      })
      .set("authorization", `Bearer ${token}`);
  });
});
