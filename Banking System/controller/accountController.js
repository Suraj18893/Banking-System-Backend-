const { response, application } = require("express");
const express = require("express");

const {
  createNewAccount,
  signup,
  createLoanAccount,
} = require("../services/createService");
const { fetchPassbook } = require("../services/fetchPassBook");
const { clientDetails } = require("../services/clientDetailsServie");

const router = express.Router();

const { calculate_age } = require("../utilities/libs");

const creatnewacc = (req, res) => {
  const saving = req.body.isSaving;
  const current = req.body.isCurrent;
  const saving_amount = req.body.savingBalance;
  const current_amount = req.body.currentBalance;

  const age = calculate_age(new Date(req.body.dob));
  // console.log(age);

  if (saving && current) {
    if (saving_amount >= 10000 && current_amount >= 100000 && age >= 18) {
      createNewAccount(req.body, (msg) => {
        res.json({ sts: "success", msg });
      });
    } else {
      res.json({
        message:
          "Please deposit money more than 10000 to open a saving account OR Please deposit money more than 100000 to open a current account OR Check Your Age",
      });
    }
  } else if (saving) {
    if (saving_amount >= 10000) {
      createNewAccount(req.body, (msg) => {
        res.json({ sts: "success", msg });
      });
    } else {
      res.json({
        message:
          "Please deposit money more than 10000 to open a saving account",
      });
    }
  } else if (current) {
    if (current_amount >= 100000 && age >= 18) {
      createNewAccount(req.body, (msg) => {
        res.json({ sts: "success", msg });
      });
    } else {
      res.json({
        message:
          "Please deposit money more than 100000 to open a current account OR check your age",
      });
    }
  }
};

const fetchPassbookDetails = (req, res) => {
  fetchPassbook(req.body, (transections) => {
    res.json({ sts: "success", transections });
  });
};

const fetchClientDetails = (req, res) => {
  clientDetails(req.body, (details) => {
    if (details == undefined) {
      res.json({ message: "please enter correct credentials" });
    } else {
      res.json({ sts: "success", details });
    }
  });
};

const signUpclient = (req, res) => {
  signup(req.body, (message) => {
    res.json({ sts: "success", message });
  });
};

const createloan = (req, res) => {
  const loanAmount = req.body.amount;
  const loanDuration = req.body.loanDuration;
  if (loanAmount < 50000 && loanDuration < 2) {
    res.json({
      sts: "declined",
      message:
        "please check amount or duration, loan amount should be more than 50000 and loan duration should be minimum 2 years",
    });
  }
  createLoanAccount(req.body, (message) => {
    res.json({ sts: "success", message });
  });
};

module.exports = {
  creatnewacc,
  fetchPassbookDetails,
  fetchClientDetails,
  signUpclient,
  createloan,
};
