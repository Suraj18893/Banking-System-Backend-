const dotenv = require("dotenv").config({ path: "../.env" });
const { Client } = require("pg");
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

const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const {
  updateBalanceIntoSaving,
  insertIntoTransection,
  updateBalanceIntoCurrent,
  updateBalanceIntoLoan,
} = require("../models/transectionModels");
const {
  totalWithDrawAmountSaving,
  findUserSaving,
  findUserCurrent,
  findUserLoan,
} = require("../models/userModels");

const { formatDate, findUserId } = require("../utilities/libs");

const withdraw = async (
  {
    userName,
    amount,
    accountType,
    accountNumber,
    IsAtm = false,
    atmCardNumber,
    cvvNumber,
    expiryDate,
  },
  onWithdraw = undefined
) => {
  const Id = findUserId(userName);
  if (accountType == "saving") {
    const currentDate = Date(Date.now()).toString();
    const formattedDate = formatDate(currentDate);
    const transectionType1 = "withdrawn from savings";
    const transectionType2 = "withdrawn from savings by ATM";
    // -----------------------------------------------
    return await (async () => {
      const restotalWithDrawAmountSaving = await totalWithDrawAmountSaving({
        Id,
        formattedDate,
        transectionType1,
        transectionType2,
        accountNumber,
      });
      if (
        parseFloat(0 - restotalWithDrawAmountSaving.rows[0].sum) +
          parseFloat(amount) >
        50000
      ) {
        if (onWithdraw) {
          console.log("reached");
          onWithdraw({
            message: "Daily transection limit of 50,000 INR reached",
          });
        }
        return {
          message: "Daily transection limit of 50,000 INR reached",
        };
      }
      const resfindUserSaving = await findUserSaving(Id);
      let balance = 0;
      let indexOfUser;
      for (let i = 0; i < resfindUserSaving.rows.length; i++) {
        if (resfindUserSaving.rows[i].account_number == accountNumber) {
          balance = parseFloat(resfindUserSaving.rows[i].balance);
          indexOfUser = i;
          break;
        }
        if (i == resfindUserSaving.rows.length - 1 && balance == 0) {
          if (onWithdraw) {
            onWithdraw({
              sts: "failed",
              message:
                "authentication declined as you have entered invalid account number",
            });
            return;
          }
        }
      }

      if (balance < amount) {
        if (onWithdraw) {
          onWithdraw(
            `${amount} cannot be withdrawn as you don't have enough balance`
          );
          return;
        }
      }

      if (IsAtm) {
        let auth = true;
        let noAtmTransectionsPerMonth = 0;
        if (
          resfindUserSaving.rows[indexOfUser].account_number == accountNumber
        ) {
          if (
            atmCardNumber != resfindUserSaving.rows[indexOfUser].atm_card_no ||
            cvvNumber != resfindUserSaving.rows[indexOfUser].cvv_no ||
            formatDate(expiryDate) !=
              formatDate(resfindUserSaving.rows[indexOfUser].expiry_date)
          ) {
            if (onWithdraw) {
              onWithdraw({
                sts: "failed",
                message:
                  "authentication declined as you have entered invalid ATM card credentials for ATM transection",
              });
            }
            auth=false;
            return {
              sts: "failed",
              message:
                "authentication declined as you have entered invalid ATM card credentials for ATM transection",
            };
          } else {
            noAtmTransectionsPerMonth =
              resfindUserSaving.rows[indexOfUser].no_of_atm_transections;
          }
        }
        

        const transectionID = uuidv4();

        if (noAtmTransectionsPerMonth >= 5 && auth) {
          const newBalance = balance - parseFloat(amount) - 500;
          const newNoAtmTransectionsPerMonth = noAtmTransectionsPerMonth + 1;
          await updateBalanceIntoSaving({
            newBalance,
            newNoAtmTransectionsPerMonth,
            Id,
            accountNumber,
          });

          const atmCharge_transection_type = `Penalty for ATM transection id ${transectionID}`;
          const atmCharge_transectionID = uuidv4();
          const penaltyMoney = -500;
          const todayDate = new Date();

          await insertIntoTransection({
            Id,
            TransectionMoney: penaltyMoney,
            transection_type: atmCharge_transection_type,
            todayDate,
            transectionID: atmCharge_transectionID,
            accountNumber,
          });

          const transection_type = "withdrawn from savings by ATM";
          const TransectionMoney = 0 - amount;
          // const todayDate = new Date();

          await insertIntoTransection({
            Id,
            TransectionMoney,
            transection_type,
            todayDate,
            transectionID,
            accountNumber,
          });
          if (onWithdraw) {
            onWithdraw(
              `Amount ${amount} Withdraw Successfully and 500 INR debited because you have cross the limit of maximum ATM transections`
            );
          }
          return {
            message: `Amount ${amount} Withdraw Successfully and 500 INR debited because you have cross the limit of maximum ATM transections`,
          };
        } else if(auth && noAtmTransectionsPerMonth < 5) {
          const newBalance = balance - parseFloat(amount);
          // console.log(noAtmTransectionsPerMonth);
          const newNoAtmTransectionsPerMonth = noAtmTransectionsPerMonth + 1;
          await updateBalanceIntoSaving({
            newBalance,
            newNoAtmTransectionsPerMonth,
            Id,
            accountNumber,
          });
          const transection_type = "withdrawn from savings by ATM";
          const TransectionMoney = 0 - amount;
          const todayDate = new Date();

          await insertIntoTransection({
            Id,
            TransectionMoney,
            transection_type,
            todayDate,
            transectionID,
            accountNumber,
          });
          if (onWithdraw) onWithdraw(`Amount ${amount} Withdraw Successfully`);
          return { message: `Amount ${amount} Withdraw Successfully` };
        }
      } else {
        const noAtmTransectionsPerMonth =
          resfindUserSaving.rows[indexOfUser].no_atm_transections_per_month;
        const newBalance = balance - parseFloat(amount);

        await updateBalanceIntoSaving({
          newBalance,
          noAtmTransectionsPerMonth,
          Id,
          accountNumber,
        });

        const transectionID = uuidv4();
        const transection_type = "withdrawn from savings";
        const todayDate = new Date();
        const TransectionMoney = 0 - amount;

        await insertIntoTransection({
          Id,
          TransectionMoney,
          transection_type,
          todayDate,
          transectionID,
          accountNumber,
        });

        if (onWithdraw) onWithdraw(`Amount ${amount} Withdraw Successfully`);
        return { message: `Amount ${amount} Withdraw Successfully` };
      }
    })();
  } else if (accountType == "current") {
    let res;
    await (async () => {
      const resfindUserCurrent = await findUserCurrent(Id);
      let balance = 0;
      let indexOfUser;
      for (let i = 0; i < resfindUserCurrent.rows.length; i++) {
        if (resfindUserCurrent.rows[i].account_number == accountNumber) {
          balance = parseFloat(resfindUserCurrent.rows[i].balance);
          indexOfUser = i;
          break;
        }
        if (i == resfindUserCurrent.rows.length - 1 && balance == 0) {
          if (onWithdraw) {
            onWithdraw({
              sts: "failed",
              message:
                "authentication declined as you have entered invalid account number",
            });
            return;
          }
        }
      }
      // -----------------------------------------
      const NoOfTransectionsThisMonth =
        resfindUserCurrent.rows[indexOfUser].no_of_transections_this_month;
      const NewNoOfTransectionsThisMonth = NoOfTransectionsThisMonth + 1;
      const transectionCharge = Math.min(500, amount * (0.5 / 100));
      if (balance < amount) {
        if (onWithdraw) {
          onWithdraw(
            `${amount} cannot be withdrawn as you don't have enough balance`
          );
          return;
        }
        res = {
          message: `${amount} cannot be withdrawn as you don't have enough balance`,
        };
      }
      const newBalance =
        balance - parseFloat(amount) - parseFloat(transectionCharge);

      const transection_type = "withdrawn from current";
      const todayDate = new Date();
      const transectionID = uuidv4();
      const TransectionMoney = 0 - amount;

      await updateBalanceIntoCurrent({
        newBalance,
        NewNoOfTransectionsThisMonth,
        Id,
        accountNumber,
      });

      await insertIntoTransection({
        Id,
        TransectionMoney,
        transection_type,
        todayDate,
        transectionID,
        accountNumber,
      });

      const transectionChargeTransectionID = uuidv4();
      const transectionCharge_transection_type = `transection charge for transection id ${transectionID}`;

      await insertIntoTransection({
        Id,
        TransectionMoney: 0 - transectionCharge,
        transection_type: transectionCharge_transection_type,
        todayDate,
        transectionID: transectionChargeTransectionID,
        accountNumber,
      });

      if (onWithdraw) {
        onWithdraw(`Amount ${amount} Withdraw Successfully`);
        return;
      }
      if (!res) {
        res = {
          message: `Amount ${amount} Withdraw Successfully`,
        };
      }
    })();
    return res;
  } else {
    if (onWithdraw) {
      onWithdraw({ sts: "failed", message: "please check your data" });
    }
  }
};

const deposit = async (
  { userName, amount, accountType, accountNumber },
  onDeposit = undefined
) => {
  const Id = findUserId(userName);
  if (accountType == "saving") {
    await (async () => {
      const resfindUserSaving = await findUserSaving(Id);
      let balance = 0;
      let indexOfUser;
      for (let i = 0; i < resfindUserSaving.rows.length; i++) {
        if (resfindUserSaving.rows[i].account_number == accountNumber) {
          balance = parseFloat(resfindUserSaving.rows[i].balance);
          indexOfUser = i;
          break;
        }
        if (i == resfindUserSaving.rows.length - 1 && balance == 0) {
          if (onDeposit) {
            onDeposit({
              sts: "failed",
              message:
                "authentication declined as you have entered invalid account number",
            });
            return;
          }
        }
      }

      const newBalance = balance + parseFloat(amount);

      const noAtmTransectionsPerMonth =
        resfindUserSaving.rows[indexOfUser].no_of_atm_transections;

      await updateBalanceIntoSaving({
        newBalance,
        newNoAtmTransectionsPerMonth: noAtmTransectionsPerMonth,
        Id,
        accountNumber,
      });

      const transectionID = uuidv4();
      const transection_type = "deposited to savings";
      const todayDate = new Date();

      const TransectionMoney = amount;

      await insertIntoTransection({
        Id,
        TransectionMoney,
        transection_type,
        todayDate,
        transectionID,
        accountNumber,
      });

      if (onDeposit) {
        onDeposit(`Amount ${amount} deposited Successfully`);
      }
    })();
  } else if (accountType == "current") {
    let res;
    await (async () => {
      const resfindUserCurrent = await findUserCurrent(Id);
      let balance = 0;
      let indexOfUser;
      for (let i = 0; i < resfindUserCurrent.rows.length; i++) {
        if (resfindUserCurrent.rows[i].account_number == accountNumber) {
          balance = parseFloat(resfindUserCurrent.rows[i].balance);
          indexOfUser = i;
          break;
        }
        if (i == resfindUserCurrent.rows.length - 1 && balance == 0) {
          if (onDeposit) {
            onDeposit({
              sts: "failed",
              message:
                "authentication declined as you have entered invalid account number",
            });
            return;
          }
        }
      }

      const NoOfTransectionsThisMonth =
        resfindUserCurrent.rows[indexOfUser].no_of_transections_this_month;
      const NewNoOfTransectionsThisMonth = NoOfTransectionsThisMonth + 1;
      const transectionCharge = Math.min(500, amount * (0.5 / 100));
      const newBalance =
        balance + parseFloat(amount) - parseFloat(transectionCharge);

      const transection_type = "deposited to current";
      const todayDate = new Date();
      const transectionID = uuidv4();
      const TransectionMoney = amount;

      await updateBalanceIntoCurrent({
        newBalance,
        NewNoOfTransectionsThisMonth,
        Id,
        accountNumber,
      });

      await insertIntoTransection({
        Id,
        TransectionMoney,
        transection_type,
        todayDate,
        transectionID,
        accountNumber,
      });

      const transectionChargeTransectionID = uuidv4();
      const transectionCharge_transection_type = `transection charge for transection id ${transectionID}`;

      await insertIntoTransection({
        Id,
        TransectionMoney: 0 - transectionCharge,
        transection_type: transectionCharge_transection_type,
        todayDate,
        transectionID: transectionChargeTransectionID,
        accountNumber,
      });

      if (onDeposit) {
        onDeposit(`Amount ${amount} deposited Successfully`);
      }
      if (!res) {
        res = {
          message: `Amount ${amount} deposited Successfully`,
        };
      }
    })();
    return res;
  } else if (accountType == "loan") {
    return await (async () => {
      const resfindUserLoan = await findUserLoan(Id);
      let loanAmount = 0;
      let indexOfUser;
      for (let i = 0; i < resfindUserLoan.rows.length; i++) {
        if (resfindUserLoan.rows[i].account_number == accountNumber) {
          loanAmount = parseFloat(resfindUserLoan.rows[i].loan_amount);
          indexOfUser = i;
          break;
        }
        if (i == resfindUserLoan.rows.length - 1 && balance == 0) {
          if (onDeposit) {
            onDeposit({
              sts: "failed",
              message:
                "authentication declined as you have entered invalid account number",
            });
            return;
          }
        }
      }

      // --------------------------------

      if (loanAmount * 0.1 < amount) {
        if (onDeposit) {
          onDeposit(
            `cannot be deposited as it is exceding maximum depositing amount
            }`
          );
        }
        return{
          message : "cannot be deposited as it is exceding maximum depositing amount"
        };
      } else {
        const loanBalance = parseFloat(
          resfindUserLoan.rows[indexOfUser].loan_balance
        );
        const newLoanBalance = loanBalance - parseFloat(amount);

        await updateBalanceIntoLoan({ newLoanBalance, Id, accountNumber });

        const transection_type = "deposited to loan";
        const todayDate = new Date();
        const transectionID = uuidv4();

        await insertIntoTransection({
          Id,
          TransectionMoney: amount,
          transection_type,
          todayDate,
          transectionID,
          accountNumber,
        });

        if (onDeposit) {
          onDeposit(`money deposited successfully to your loan account`);
        }
        return{
          message : "money deposited successfully to your loan account"
        }
      }
    })();
  }
};

module.exports = {
  deposit,
  withdraw,
};
