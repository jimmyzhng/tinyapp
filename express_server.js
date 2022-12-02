const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require('bcryptjs');
const helpers = require('./helpers.js');
const methodOverride = require('method-override');

app.set('view engine', 'ejs');

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

// Random URL generator
const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['Poop', 'Peepee'],
}));

app.use(methodOverride('_method'));

// Homepage
app.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  return res.redirect('/login');
});

// URL Stuff

// URL page
app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    newUrls: helpers.urlsForUser(req.session.user_id, urlDatabase),
    users,
    cookies: req.session
  };

  console.log(urlDatabase);
  if (!req.session.user_id) {
    return res.send('You must be logged in to create URLs!\n');
  }

  return res.render('urls_index', templateVars);
});

// Creating new URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send('You must be logged in to create URLs!\n');
  }

  const key = generateRandomString();
  console.log(req.session.user_id);
  urlDatabase[key] = {};
  urlDatabase[key].longURL = req.body.longURL;
  urlDatabase[key].userID = req.session.user_id;


  return res.redirect(`/urls/${key}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    cookies: req.session
  };

  if (!templateVars.cookies.user_id) {
    return res.redirect('/login');
  }

  return res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users,
    cookies: req.session
  };
  const user = req.session.user_id;

  if (!user) {
    return res.status(401).send('Sorry, you must be logged in to view this page.');
  }

  if (user !== urlDatabase[templateVars.id].userID) {
    return res.status(401).send('Sorry, you must have created this link to view this page.');
  }

  return res.render('urls_show', templateVars);
});

// Editing URL
app.put('/urls/:id', (req, res) => {
  let id = req.params.id;
  const user = req.session.user_id;

  // id does not exist
  if (!urlDatabase[id]) {
    return res.status(404).send('Sorry, that ID does not exist!\n');
  }
  // user not logged in
  if (!user) {
    return res.status(401).send('Please login first!\n');
  }
  // user does not own url
  if (urlDatabase[id].userID !== user) {
    return res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }

  urlDatabase[id].longURL = req.body.longURL;
  return res.redirect('/urls');
});

// Short URL redirecting to Long URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    return res.status(404).send('Sorry, that short URL does not exist!');
  }
  return res.redirect(longURL);
});

// Deleting URL
app.delete("/urls/:id", (req, res) => {
  let id = req.params.id;
  const user = req.session.user_id;
  console.log('id', id);

  if (!urlDatabase[id]) {
    return res.status(404).send('Sorry, that ID does not exist!\n');
  }

  if (!user) {
    return res.status(401).send('Please login first!\n');
  }

  if (urlDatabase[id].userID !== user) {
    return res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login/Logout
app.get('/login', (req, res) => {
  const templateVars = {
    users,
    cookies: req.session
  };

  if (templateVars.cookies.user_id) {
    return res.redirect('/urls');
  }

  return res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = helpers.getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('Sorry, that account does not exist!');
  }

  if (!bcrypt.compareSync(password, users[user].hashedPw)) {
    return res.status(403).send('Sorry, that password is invalid. You have 1 more try, or you will be IP banned from our website.');
  }

  req.session.user_id = user;
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

// Registration
app.get('/register', (req, res) => {
  const templateVars = {
    users,
    cookies: req.session
  };

  if (templateVars.cookies.user_id) {
    return res.redirect('/urls');
  }

  return res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPw = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('Sorry, please enter a valid email and password.');
  }

  if (helpers.getUserByEmail(email, users)) {
    return res.status(400).send('Sorry, that account already exists!');
  }

  users[userId] = { userId, email, hashedPw };
  req.session.user_id = userId;
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

