const { response, application } = require("express");
const express = require("express");

const {
  createNewAccount,
  signup,
  createLoanAccount,
} = require("../services/createService");
const { fetchPassbook } = require("../services/fetchPassBook");
const { clientDetails } = require("../services/clientDetailsService");
const router = express.Router();
const { calculate_age } = require("../utilities/libs");

const creatnewacc = (req, res) => {
  createNewAccount(req.body, (msg) => {
    res.json(msg);
  });
};

const fetchPassbookDetails = (req, res) => {
  fetchPassbook(req.body, (transections) => {
    res.json({ sts: "success", transections });
  });
};

const fetchClientDetails = (req, res) => {
  clientDetails(req.body, (details) => {
    res.json({ sts: "success", details });
  });
};

const signUpclient = (req, res) => {
  signup(req.body, (message) => {
    res.json({ message });
  });
};

const createloan = (req, res) => {
  const loanAmount = req.body.loanAmount;
  const loanDuration = req.body.loanDuration;
  if (loanAmount < 500000 || loanDuration < 2) {
    res.json({
      sts: "declined",
      message:
        "please check amount or duration, loan amount should be more than 500000 and loan duration should be minimum 2 years",
    });
  } else {
    createLoanAccount(req.body, (message) => {
      res.json( message );
    });
  }
};

module.exports = {
  creatnewacc,
  fetchPassbookDetails,
  fetchClientDetails,
  signUpclient,
  createloan,
};
