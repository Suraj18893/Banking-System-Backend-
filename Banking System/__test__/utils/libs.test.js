const {
  findUserId,
  addYears,
  calculate_age,
  formatDate,
  monthDiff,
  validateEmail,
  validateUserName,
  validatePhoneNumber,
} = require("../../utilities/libs.js");

describe("utility functions tests", () => {
  describe("monthDiff diff", () => {
    it("should return difference between 2 months", () => {
      expect(monthDiff(new Date("2022-01-01"), new Date("2022-02-01"))).toEqual(
        1
      );
      expect(monthDiff(new Date("2022-01-01"), new Date("2023-02-01"))).toEqual(
        13
      );
    });
  });
  describe("add years", () => {
    it("should return date by adding years to it", () => {
      expect(addYears(new Date("2022-01-01"), 5)).toEqual(
        new Date("2027-01-01")
      );
      expect(addYears(new Date("2022-01-01"), 2)).toEqual(
        new Date("2024-01-01")
      );
    });
  });

  describe("validate email", () => {
    it("should work as expected", () => {
      expect(validateEmail("pas@dwd.com")).toEqual(true);
      expect(validateEmail("pasdwd.com")).toEqual(false);
      expect(validateEmail("pasd@wdcom")).toEqual(false);
    });
  });

  describe("validate phone number", () => {
    it("should work as expected", () => {
      expect(validatePhoneNumber("9999999999")).toEqual(true);
      expect(validatePhoneNumber("999999999")).toEqual(false);
      expect(validatePhoneNumber("99999999999")).toEqual(false);
    });
  });
  describe("validate username", () => {
    it("should work as expected", () => {
      expect(validateUserName("abcd")).toEqual(true);
      expect(validateUserName("ASDDW")).toEqual(true);
      expect(validateUserName("ADwd")).toEqual(true);
      expect(validateUserName("ADwd1")).toEqual(false);
    });
  });
});
