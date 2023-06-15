const app = require("./../../app");
const supertest = require("supertest");
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


describe("Auth endpoints", () => {
  let token;

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

  it("should not create account, invalid details", async () => {
    let res = await supertest(app).post("/signup").send({
      userName: "suraj",
      fullname: "sur",
      email: "surajgmail.com",
      phonenumber: "7906753094",
      dob: "1988-8-28",
      password: "inito@22",
    });
    expect(res.body.message.message).toMatch("please check your email, ");
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

  it("should login", async () => {
    let res = await supertest(app).post("/login").send({
      userName: "suraj",
      password: "inito@22",
    });
    token = res.text;
    expect(token).not.toBeNull();
  });

  it("should not login, wrong password", async () => {
    let res = await supertest(app).post("/login").send({
      userName: "suraj",
      password: "ini",
    });
    expect(res.body.message).toMatch(
      "invalid credentials please check userName or Password"
    );
  });

  it("should not login, user doesnt exist", async () => {
    let res = await supertest(app).post("/login").send({
      userName: "sooraj",
      password: "inito@22",
    });
    expect(res.body.message).toMatch(
      "invalid credentials please check userName or Password"
    );
  });
});
