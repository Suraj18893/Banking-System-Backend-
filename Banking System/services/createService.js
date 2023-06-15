const { query } = require("express");
const bcrypt = require("bcrypt");
const { Client } = require("pg");
const moment = require("moment");

const dotenv = require("dotenv").config({ path: "../.env" });

// console.log(dotenv);

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

client.connect();

const {
  findUserId,
  addYears,
  calculate_age,
  validateEmail,
  validateUserName,
  validatePhoneNumber,
  formatDate,
} = require("../utilities/libs");

const {
  findDob,
  findUser,
  findUserSaving,
  findUserCurrent,
  findUserAccount,
} = require("../models/userModels");

const {
  insertIntoAccount,
  insertIntoSaving,
  insertIntoCurrent,
  insertIntoUser,
  insertIntoLoan,
  updateIntoAccount,
  updateIntoAccountSavingCurrent,
} = require("../models/createModels");

const createNewAccount = async (
  {
    userName,
    isSaving = false,
    isCurrent = false,
    savingBalance,
    currentBalance,
  },
  onCreate = undefined
) => {
  const Id = findUserId(userName);
  const dateOfOpening = new Date();
  // to validate age for current
  let isAgeLess = false;
  await (async () => {
    const resDateOfBirth = await findDob(Id);
    if (resDateOfBirth.rows[0]) {
      const dateOfBirth = resDateOfBirth.rows[0].dob;
      const age = calculate_age(dateOfBirth);
      if (age < 18 && isCurrent) {
        if (onCreate) {
          onCreate({
            sts: "failed",
            message:
              "current account cannot be created as the age is less than 18",
          });
        }
        isAgeLess = true;
        return;
      }
    } else {
      console.log(122);
      if (onCreate) {
        onCreate("User doesnot exist, Please signup");
      }
      return;
    }
  })();

  if (isAgeLess) {
    return {
      sts: "failed",
      message: "current account cannot be created as the age is less than 18",
    };
  }

  //-----

  if (!isSaving && !isCurrent) {
    if (onCreate)
      onCreate({
        sts: "failed",
        message: "please select an account to open",
      });
  } else {
    if (isSaving && isCurrent) {
      if (savingBalance >= 10000 && currentBalance >= 100000) {
        const savingAccountNumber = Math.floor(Math.random() * 1000000000);
        const currentAccountNumber = Math.floor(Math.random() * 1000000000);

        await updateIntoAccountSavingCurrent({
          Id,
          isSaving: true,
          isCurrent: true,
        });

        const atm_number =
          (Math.random() + " ").substring(2, 10) +
          (Math.random() + " ").substring(2, 10);
        const expiryDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 5)
        );
        const cvv_number = Math.floor(Math.random() * (999 - 100 + 1) + 100);
        const no_of_atm_transections = 0;

        await insertIntoSaving({
          Id,
          savingBalance,
          atm_number,
          expiryDate,
          cvv_number,
          no_of_atm_transections,
          savingAccountNumber,
          dateOfOpening,
        });

        const no_of_transections = 0;
        await insertIntoCurrent({
          Id,
          currentBalance,
          no_of_transections,
          currentAccountNumber,
          dateOfOpening,
        });

        if (onCreate)
          onCreate({
            sts: "success",
            message: "account created successfully",
          });
      } else {
        if (onCreate) {
          onCreate({
            sts: "failed",
            message: `please check ${
              savingBalance < 10000
                ? "Saving Balance should be minimun 10,000 INR, "
                : ""
            }${
              currentBalance < 100000
                ? "Current Balance should be minimun 100,000 INR, "
                : ""
            }`,
          });
        }
      }
    } else if (isSaving) {
      if (isSaving && savingBalance >= 10000) {
        const savingAccountNumber = Math.floor(Math.random() * 1000000000);

        await (async () => {
          const resfindUserAccount = await findUserAccount(Id);
          isCurrent = resfindUserAccount.rows[0].is_current;
          await updateIntoAccountSavingCurrent({
            Id,
            isSaving,
            isCurrent,
          });
        })();

        const atm_number =
          (Math.random() + " ").substring(2, 10) +
          (Math.random() + " ").substring(2, 10);
        let expiryDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 5)
        );
        const cvv_number = Math.floor(Math.random() * (999 - 100 + 1) + 100);
        await insertIntoSaving({
          Id,
          savingBalance,
          atm_number,
          expiryDate,
          cvv_number,
          no_of_atm_transections: 0,
          savingAccountNumber,
          dateOfOpening,
        });

        if (onCreate) {
          onCreate({
            sts: "success",
            message: "account created successfully",
            account_Number: `${savingAccountNumber}`,
            atmCardNumber: `${atm_number}`,
            cvvNumber: `${cvv_number}`,
            expiryDate: `${expiryDate}`,
          });
        }

        return {
          sts: "success",
          message: "account created successfully",
          account_Number: `${savingAccountNumber}`,
          atmCardNumber: `${atm_number}`,
          cvvNumber: `${cvv_number}`,
          expiryDate: `${expiryDate}`,
        };
      } else {
        if (onCreate) {
          onCreate({
            sts: "failed",
            message: `please check ${
              savingBalance < 10000
                ? "Saving Balance should be minimun 10,000 INR, "
                : ""
            }`,
          });
        }
        return {
          message: "Saving Balance should be minimun 10,000 INR, ",
        };
      }
    } else if (isCurrent) {
      if (isCurrent && currentBalance >= 100000) {
        const currentAccountNumber = Math.floor(Math.random() * 1000000000);
        await (async () => {
          const resfindUserAccount = await findUserAccount(Id);
          isCurrent = resfindUserAccount.rows[0].is_saving;
          await updateIntoAccountSavingCurrent({
            Id,
            isSaving,
            isCurrent: true,
          });
        })();

        const no_of_transections = 0;
        await insertIntoCurrent({
          Id,
          currentBalance,
          no_of_transections,
          currentAccountNumber,
          dateOfOpening,
        });
        if (onCreate)
          onCreate({
            sts: "success",
            message: "account created successfully",
            account_Number: `${currentAccountNumber}`,
          });

        return {
          sts: "success",
          message: "account created successfully",
          account_Number: `${currentAccountNumber}`,
        };
      } else {
        if (onCreate) {
          onCreate({
            sts: "failed",
            message: `please check ${
              currentBalance < 100000
                ? "Current Balance should be minimun 100,000 INR, "
                : ""
            }`,
          });
        }

        return {
          sts: "failed",
          message: `please check ${
            currentBalance < 100000
              ? "Current Balance should be minimun 100,000 INR, "
              : ""
          }`,
        };
      }
    }
  }
};

const signup = async (
  { userName, fullname, email, phonenumber, dob, password },
  onSignup = undefined
) => {
  const Id = findUserId(userName);
  if (Id) {
    await (async () => {
      const resUserData = await findUser(Id);
      if (resUserData.rows[0]) {
        if (onSignup) {
          onCreate({
            sts: "failed",
            message: "Username already exist, please try a different username",
          });
        }
      }
    })();
  }

  if (
    validateEmail(email) &&
    validateUserName(userName) &&
    validatePhoneNumber(phonenumber)
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await insertIntoUser({
      Id,
      fullname,
      email,
      phonenumber,
      hashedPassword,
      dob,
      userName,
    });

    await insertIntoAccount({
      Id,
      userName,
      isSaving: false,
      isCurrent: false,
      isLoan: false,
    });

    if (onSignup) {
      onSignup({
        sts: "success",
        message: `New User Created Successfully`,
      });
    }
    return {
      sts: "success",
      message: `New User Created Successfully`,
    };
  } else {
    if (onSignup)
      onSignup({
        sts: "error",
        message: `please check your ${validateEmail(email) ? "" : "email, "}${
          validateUserName(userName) ? "" : "userName, "
        }${validatePhoneNumber(phonenumber) ? "" : "phone number"}`,
      });
    return {
      sts: "error",
      message: `please check your ${validateEmail(email) ? "" : "email, "}${
        validateUserName(userName) ? "" : "userName, "
      }${validatePhoneNumber(phonenumber) ? "" : "phone number"}`,
    };
  }
};

const createLoanAccount = async (
  { userName, loanAmount, loanType, loanDuration },
  oncreateLoanAccount = undefined
) => {
  const loanAccountNumber = Math.floor(Math.random() * 1000000000);
  const Id = findUserId(userName);

  if (loanAmount < 500000) {
    return {
      message:
        "please check amount, loan amount should be more than 500000",
    };
  }
  if(loanDuration<2){
    return {
      message : "please check loan duration, loan duration should be at least 2 years"
    }
  }

  return await (async () => {
    const resDateOfBirth = await findDob(Id);
    if (resDateOfBirth.rows[0]) {
      const dateOfBirth = resDateOfBirth.rows[0].dob;
      const age = calculate_age(dateOfBirth);
      if (age < 25) {
        if (oncreateLoanAccount)
          oncreateLoanAccount(
            "Loan account cannot be created as the age is less than 25"
          );
        return {
          message: "Loan account cannot be created as the age is less than 25",
        };
      }
    }

    const resUserSaving = await findUserSaving(Id);
    const resUserCurrent = await findUserCurrent(Id);

    if (resUserSaving.rows[0] || resUserCurrent.rows[0]) {
      let totalSavingBalance = 0;
      let totalCurrentBalance = 0;
      for (let i = 0; i < resUserSaving.rows.length; i++) {
        totalSavingBalance += parseFloat(resUserSaving.rows[i].balance);
      }
      for (let i = 0; i < resUserCurrent.rows.length; i++) {
        totalCurrentBalance += parseFloat(resUserCurrent.rows[i].balance);
      }

      const totalBalance =
        parseFloat(totalSavingBalance) + parseFloat(totalCurrentBalance);
      const maximumLoanAmount = parseFloat(totalBalance * 0.4);
      if (maximumLoanAmount < loanAmount) {
        if (oncreateLoanAccount) {
          oncreateLoanAccount({
            sts: "failed",
            message: `Insufficent balance in current & savings`,
          });
        }
        return {
          sts: "failed",
          message: `Insufficent balance in current & savings`,
        };
      }
    } else {
      if (oncreateLoanAccount) {
        oncreateLoanAccount({
          sts: "failed",
          message:
            "user doesnot exist. please create a saving/current account first",
        });
      }
      return {
        sts: "failed",
        message:
          "user doesnot exist. please create a saving/current account first",
      };
    }

    const todayDate = new Date();
    const loanEndDate = addYears(todayDate, loanDuration);

    await insertIntoLoan({
      loanBalance: loanAmount,
      loanAmount,
      loanType,
      loanEndDate,
      todayDate,
      loanAccountNumber,
      Id,
    });
    await updateIntoAccount(Id);
    if (oncreateLoanAccount) {
      oncreateLoanAccount({
        message: "user loan account created successfully",
        loanAccountNumber: `${loanAccountNumber}`,
      });
    }

    return {
      message: "user loan account created successfully",
      loanAccountNumber: `${loanAccountNumber}`,
    };
  })();
};

module.exports = {
  createNewAccount,
  createLoanAccount,
  signup,
};
