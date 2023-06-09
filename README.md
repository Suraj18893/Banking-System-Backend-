# Banking Application

This is a banking application that provides various features for managing bank accounts, transactions, and loans. It allows users to open accounts, make transactions, transfer money, and obtain account details and passbooks. The system incorporates authentication to ensure secure access to user accounts.

## Table of Contents
- [Features](#features)
- [Account Details and Properties](#account-details-and-properties)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Authentication**: Secure user authentication system with login credentials verification.
- **Account Management**: Users can open accounts in the bank and receive unique account numbers.
- **Transactions**: Users can deposit and withdraw money, both through direct transactions and ATM transactions.
- **Money Transfer**: Transfer funds between own accounts or to other accounts (applicable for current accounts only).
- **Account Details**: Retrieve account information, including account number, current balance, and opening date.
- **Passbook**: Generate a passbook with a record of all bank transactions for a specific account.
- **Account Types**: Supports saving accounts, current accounts, and loan accounts with specific properties.

## Account Details and Properties

1. Saving Account Properties:
   - 6% interest every year. Interest is added on the last day of each month.
   - Net Relationship Value (NRV): Rs. 100,000 per month.
   - Minimum opening amount: Rs. 10,000.
   - ATM card allotted to each saving bank account.
   - No minimum age limit to open a Saving account.
   - Transaction Limits:
     - Maximum of 5 ATM withdrawals per month, with charges for additional withdrawals.
     - Maximum withdrawal amount per transaction: Rs. 20,000.
     - No limit on direct transactions.
     - Maximum daily withdrawal: Rs. 50,000.

2. Current Account Properties:
   - No interest.
   - Net Relationship Value (NRV): Rs. 500,000 per month.
   - Minimum opening amount: Rs. 100,000.
   - Minimum age limit to open a Current account: 18 years.
   - Transaction Limits:
     - Transaction charge: 0.5% of the transactional value, with a maximum charge of Rs. 500 per transaction.
     - No limit on the number of transactions.
     - Minimum of 3 transactions per month required, else a penalty will be charged.

3. Loan Account Properties:
   - Available Loans: Home Loan, Car Loan, Personal Loan, Business Loan.
   - Interest compounded half-yearly.
   - Customers must have a Savings or Current account in the same bank to open a Loan Account.
   - Minimum age limit to open a Loan account: 25 years.
   - The bank can only provide loans up to 40% of the total deposits.
   - Minimum duration of the loan account: 2 years.
   - Minimum loan amount: Rs. 500,000.
   - Lump sum repayments allowed, not exceeding 10% of the total loan amount.
