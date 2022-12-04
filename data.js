const bcrypt = require('bcryptjs');

const users = {
  jimmyzhng: {
    id: "jimmyzhng",
    email: "jimmyzhang1@hotmail.com",
    password: "123450",
    hashedPw: bcrypt.hashSync('123450', 10)
  },
  travis123: {
    id: "travis123",
    email: "trav@hotmail.com",
    password: "123",
    hashedPw: bcrypt.hashSync('123', 10)
  }
};

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "jimmyzhng",
    visitCount: 0,
    uniqueVisitors: [],
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: "jimmyzhng",
    visitCount: 0,
    uniqueVisitors: [],
  },
  '1a2b3c': {
    longURL: 'http://www.youtube.com',
    userID: "travis123",
    visitCount: 0,
    uniqueVisitors: [],
  }
};

module.exports = { users, urlDatabase };