
const readline = require("readline");
console.log(process);
const {createNewAccount,deposit,withdraw,transfer, balance, clientName}  = require('./db')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// const {client}= require('./db')

console.log("welcome");

console.log(" Welcome To Banking App ");
console.log("\n 1. Create new account");
console.log("\n 2. Deposit Money");
console.log("\n 3. Withdraw Money");
console.log("\n 4. Check Balance");
console.log("\n 5. Transfer Money");
console.log("\n 6. Exit");

const ip = (msg) =>
  new Promise((resolve, reject) => {
    rl.question(`\n ${msg}: `, (ch) => {
      resolve(ch);
    });
  });


const Idgenerator = (UserId)=>{
  let Id =0;
  for(let i=0; i<UserId.length; i++){
    let code = UserId.charCodeAt(i);
    Id+=code;
  }
  return Id
}

const start = async () => {
  while (true) {
    const choice = await ip('Enter your choice');

    if (choice == 1) {
      console.log(`\n ✅ Create Account`);
      const acNm = await ip('Enter Your Name');
      const acId = Idgenerator(acNm);
      const balance = await ip('Deposite money more than or equal to 1000');
      
      
    } else if (choice == 2) {
      console.log(`\n ✅ Deposit Money`);
      const acId = parseInt(await ip("Enter your Id"));
      const amount = parseFloat(await ip('Enter AMount'))
      deposit({ acId, amount })
    } 
    
    else if (choice == 3) {
      console.log(`\n ✅ Withdraw Money`);
      const acId = parseInt(await ip('Enter Account Id'))
      const amount = parseFloat(await ip('Enter Amount'))

      withdraw({ acId, amount })
    } 
    
    else if (choice == 4) {

      console.log(`\n ✅ Check Balance`);
      const acId = parseInt(await ip('Enter Account Id'))
      balance(acId)
    } 
    
    else if (choice == 5) {
      console.log(`\n ✅ Please Transfer Money`);
      const srcId = parseInt(await ip('Enter Source Account Id'))
      const destId = parseInt(await ip('Enter Desitination Account Id'))
      const amount = parseFloat(await ip('Enter Amount'))

      transfer({ srcId, destId, amount })
    } 
    
    else {
      console.log(`Process terminated`);
      process.exit();
    }
  }
};

start();
