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
  updateBalanceIntoCurrent,
  insertIntoTransection,
} = require("../models/transectionModels");

const { findUserCurrent } = require("../models/userModels");
const { findUserId } = require("../utilities/libs");

const transfer = async (
  {
    userName,
    senderAccountNumber,
    reciverUserName,
    reciverAccountNumber,
    amount,
  },
  onTransfer = undefined
) => {
  await (async () => {
    // withdrawing from sender
    const senderId = findUserId(userName);
    const reciverId = findUserId(reciverUserName);
    const resfindSenderCurrent = await findUserCurrent(senderId);
    const resfindReciverCurrent = await findUserCurrent(reciverId);
    let senderBalance = 0;
    let reciverBalance = 0;
    let senderIndexOfUser;
    let reciverIndexOfUser;

    for (let i = 0; i < resfindSenderCurrent.rows.length; i++) {
      if (resfindSenderCurrent.rows[i].account_number == senderAccountNumber) {
        senderBalance = parseFloat(resfindSenderCurrent.rows[i].balance);
        senderIndexOfUser = i;
        break;
      }
      if (i == resfindSenderCurrent.rows.length - 1 && balance == 0) {
        if (onTransfer) {
          onTransfer({
            sts: "failed",
            message:
              "authentication declined as you have entered invalid sender account number",
          });
          return;
        }
      }
    }

    for (let i = 0; i < resfindReciverCurrent.rows.length; i++) {
      if (resfindReciverCurrent.rows[i].account_number == reciverAccountNumber) {
        reciverBalance = parseFloat(resfindReciverCurrent.rows[i].balance);
        reciverIndexOfUser = i;
        break;
      }
      if (i == resfindReciverCurrent.rows.length - 1 && balance == 0) {
        if (onTransfer) {
          onTransfer({
            sts: "failed",
            message:
              "authentication declined as you have entered invalid reciver account number",
          });
          return;
        }
      }
    }

  

    const NoOfTransectionsThisMonthSender =
      resfindSenderCurrent.rows[senderIndexOfUser].no_of_transections_this_month;
    const NewNoOfTransectionsThisMonthSender =
      NoOfTransectionsThisMonthSender + 1;
    const newBalanceSender = senderBalance - parseFloat(amount);

    if (senderBalance < amount) {
      if (onTransfer) {
        onTransfer(
          `${amount} cannot be transfered as you don't have enough balance`
        );
        return;
      }
    }

    let transection_type = `Transfered to ${reciverId}`;
    let todayDate = new Date();
    let transectionID = uuidv4();
    let TransectionMoney = 0 - amount;

    await updateBalanceIntoCurrent({
      newBalance: newBalanceSender,
      NewNoOfTransectionsThisMonth: NewNoOfTransectionsThisMonthSender,
      Id: senderId,
      accountNumber: senderAccountNumber
    });

    await insertIntoTransection({
      Id: senderId,
      TransectionMoney,
      transection_type,
      todayDate,
      transectionID,
      accountNumber: senderAccountNumber
    });

    // Deposited to reciver

    // const resfindReciverCurrent = await findUserCurrent(reciverId);
    const NoOfTransectionsThisMonthReciver =
      resfindReciverCurrent.rows[0].no_of_transections_this_month;
    const newBalanceReciver = reciverBalance + parseFloat(amount);

    await updateBalanceIntoCurrent({
      newBalance: newBalanceReciver,
      NewNoOfTransectionsThisMonth: NoOfTransectionsThisMonthReciver,
      Id: reciverId,
      accountNumber: reciverAccountNumber
    });

    transection_type = `Recived by ${senderId}`;
    todayDate = new Date();
    transectionID = uuidv4();

    await insertIntoTransection({
      Id: reciverId,
      TransectionMoney: amount,
      transection_type,
      todayDate,
      transectionID,
      accountNumber: reciverAccountNumber
    });

    if (onTransfer) {
      onTransfer(`Amount ${amount} transfered to ${reciverId} Successfully`);
    }
  })();

};

module.exports = {
  transfer,
};
