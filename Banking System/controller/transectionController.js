const { response, application } = require("express");
const express = require("express");

const { deposit, withdraw } = require("../db");

const withdrawMoney = (req, res) => {
  const amount = req.body.amount;
  const accountType = req.body.accountType;

  if (amount > 20000 && accountType == "saving") {
    res.json({
      status: "transection denied",
      message:
        "Please withdraw money less than 20000 INR from your saving account",
    });
  } else {
    withdraw(req.body, (msg) => {
      res.json({ sts: "success", msg });
    });
  }
};

const depositMoney = (req, res) => {
  deposit(req.body, (msg) => {
    res.json({ sts: "success", msg });
  });
};

module.exports = {
  withdrawMoney,
  depositMoney,
};
