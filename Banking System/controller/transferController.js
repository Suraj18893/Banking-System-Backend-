const { response, application } = require("express");
const express = require("express");

const { transfer } = require("../db");

const transferMoney = (req, res) => {
  transfer(req.body, (msg) => {
    res.json({ sts: "success", msg });
  });
};

module.exports = {
  transferMoney,
};
