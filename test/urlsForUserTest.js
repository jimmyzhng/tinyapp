const { assert } = require('chai');
const { urlsForUser } = require('../helpers.js');

// Data
const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "jimmyzhng"
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: "jimmyzhng"
  },
  '1a2b3c': {
    longURL: 'http://www.youtube.com',
    userID: "travis123"
  }
};

describe('urlsForUser', () => {
  it('should return URLs for the given user ID', () => {
    const test = urlsForUser("jimmyzhng", urlDatabase);
    const expected = {
      'b2xVn2': {
        longURL: 'http://www.lighthouselabs.ca',
        userID: "jimmyzhng"
      },
      '9sm5xK': {
        longURL: 'http://www.google.com',
        userID: "jimmyzhng"
      }
    };

    assert.deepEqual(test, expected);
  });

});