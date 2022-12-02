const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "jimmyzhng": {
    id: "jimmyzhng",
    email: "jimmyzhang1@hotmail.com",
    password: "i-like-turtles"
  },
  "bobbylee": {
    id: "bobbylee",
    email: "b0bbyl33@myspace.com",
    password: "fartsnifferb"
  }
};

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const test = getUserByEmail("jimmyzhang1@hotmail.com", testUsers);
    const expectedUserId = "jimmyzhng";
    assert.strictEqual(test, expectedUserId);
  });

  it('should return undefined if email is not found', () => {
    const test = getUserByEmail("fartsnifferj@hotmail.com", testUsers);
    assert.strictEqual(test, undefined);
  });
});