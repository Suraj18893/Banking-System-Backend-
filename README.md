# Banking Application

This is a banking application that provides various features for managing bank accounts, transactions, and loans. It allows users to open accounts, make transactions, transfer money, and obtain account details and passbooks. The system incorporates authentication to ensure secure access to user accounts.

## Table of Contents

- [Authentication](#authentication)
- [Account Management](#account-management)
- [Transactions](#transactions)
- [Account Details](#account-details)
- [Passbook](#passbook)
- [Account Details and Properties](#account-details-and-properties)

## Authentication

1. Existing Users:
   - Users must provide correct credentials (email and password) to log in.

2. New Users:
   - To create an account, the following fields are required:
     - Username (contains only alphabets)
     - Password
     - Full Name
     - Email
     - Phone number
     - Date of Birth (DOB)
     - Address
   - A unique customer ID is assigned based on the provided username. The system calculates the customer ID using the following series:
     - A = 1
     - B = A*2 + 2
     - C = B*2 + 3
     - The system computes the sum of the numbers corresponding to all the letters in the username.

## Account Management

1. Opening an Account:
   - Users can open accounts in the bank.
   - Required information for account opening:
     - Account Type (choose from a list of account types)
     - Amount (valid amount according to the selected account type)

2. Unique Account Number:
   - If the provided information is correct, the system generates a unique account number for the user.

## Transactions

1. Deposit:
   - Users can deposit money into their accounts.

2. Withdrawal:
   - Users can withdraw money from their accounts through two methods:
     - Direct Transaction (from bank)
     - ATM Transaction

3. Money Transfer:
   - Users can transfer money to their own accounts or to others' accounts (applicable for current accounts only).

## Account Details

- Users can retrieve all their account details, which include:
  - Account Number
  - Current Balance
  - Account Opening Date

## Passbook

- Users can obtain a passbook for each account, which contains a record of all bank transactions for that account.

## Account Details and Properties

1. Account Types:
   - Saving Account
   - Current Account
   - Loan Account

2. Saving Account Properties:
   - 6% interest every year (interest added on the last day of each month).
   - Net Relationship Value (NRV) fixed at Rs. 100,000 per month.
   - Minimum amount required to open an account: Rs. 10,000.
   - ATM card allotted to each saving bank account (with a 16-digit card number, expiry date, and CVV Number).
   - No minimum age limit to open a Saving account.
   - Transaction Limits:
     - Maximum of 5 ATM withdrawals per month (charged Rs. 500 for each additional withdrawal).
     - Maximum withdrawal amount per transaction: Rs. 20,000.
     - No limit on direct transactions.
     - Maximum daily withdrawal: Rs. 50,000 (including both direct and ATM transactions).

3. Current Account Properties:
   - No interest.
   - Net Relationship Value (NRV) fixed at Rs. 500,000 per month.
   - Minimum amount required to open an account: Rs. 100,000.
   - Minimum age limit to open a Current account: 18 years.
   - Transaction Limits:
     - Transaction charge: 0.5% of the transactional value (maximum charge: Rs. 500 per transaction).
     - No limit on the number of transactions.
     - Minimum of 3 transactions per month required; else Rs. 500 penalty will be charged.

4. Loan Account Properties:
   - Available Loans: Home Loan, Car Loan, Personal Loan, Business Loan.
   - Interest compounded half-yearly.
   - Customers must have a Savings or Current account in the same bank to open a Loan Account.
   - Minimum age limit to open a Loan account: 25 years.
   - The bank can only provide loans up to 40% of the total deposits.
   - Minimum duration of the loan account: 2 years.
   - Minimum loan amount: Rs. 500,000.
   - Lump sum repayments allowed, not exceeding 10% of the total loan amount.


