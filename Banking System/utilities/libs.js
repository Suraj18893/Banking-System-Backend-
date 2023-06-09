const alphabetsNumericValues = [
  1, 4, 11, 26, 57, 120, 247, 502, 1013, 2036, 4083, 8178, 16369, 32752, 65519,
  131054, 262125, 524268, 1048555, 2097130, 4194281, 8388584, 16777191,
  33554406, 67108837, 134217700,
];

const findUserId = (userName) => {
  let res = 0;
  userName = userName.toLowerCase();
  for (let i = 0; i < userName.length; i++) {
    res +=
      alphabetsNumericValues[userName[i].charCodeAt(0) - "a".charCodeAt(0)];
  }
  return res;
};

const addYears = (date, years) => {
  date.setFullYear(date.getFullYear() + years);
  return date;
};

const calculate_age = (dob) => {
    // console.log(dob);
    const birthDate = dob.getDate();
    const birthMonth = dob.getMonth()+1;
    const birthYear = dob.getFullYear();

    var d = new Date(Date.now()),
        currentMonth = '' + (d.getMonth() + 1),
        currentDay = '' + d.getDate(),
        currentYear = d.getFullYear();

    var age = currentYear - birthYear - 1;
    if(currentMonth > birthMonth){
        age++;
    }
    if(currentMonth==birthMonth && currentDay>=birthDate){
        age++;
    }
    return age;
}

const formatDate = (date) => {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
};



module.exports = {
  findUserId,
  addYears,
  calculate_age,
  formatDate
};
