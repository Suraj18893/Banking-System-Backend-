const app = require("./../../app");
const jwt = require("jsonwebtoken");
const {
  validateUser,
  genrateAuthToken,
} = require("../../services/authService");
const dotenv = require("dotenv").config({ path: "./../../env" });
const { signup } = require("../../services/createService.js");
const { Client } = require("pg");

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

const userData = {
  userName: "SUNIL1",
  fullname: "sur",
  email: "surajgmail.com",
  phonenumber: "12345678911111",
  dob: "1988-8-28",
  password: "inito@22",
};

describe("Auth services", () => {
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

  let token;

  it("should not create account, invalid details", async () => {
    const res = await signup(userData);
    expect(res.message).toMatch(
      "please check your email, userName, phone number"
    );
    console.log("hello")
  });
  it("should create account", async () => {
    userData.userName = "suraj";
    userData.email = "suraj@gmail.com";
    userData.phonenumber = "1234567890";
    const res = await signup(userData);
    expect(res.message).toMatch("New User Created Successfully");
  });
  it("should not return auth token, invalid credentials", async () => {
    const user = await validateUser("suraj", "inito@2");
    if (user) {
      token = await genrateAuthToken(user);
    }
    expect(token).toEqual(undefined);
  });
  it("should return auth token, valid credentials", async () => {
    const user = await validateUser("suraj", "inito@22");
    token = await genrateAuthToken(user);
    expect(token).not.toEqual(undefined);
    const { id } = jwt.verify(token, SECRET);
    expect(id).toEqual(user.id);
  });
});
