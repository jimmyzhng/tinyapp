const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');

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

// Check if email exists
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return false;
};

// Returns URLs where the userID is equal to the id of current user
const urlsForUser = (userID, urls) => {
  const output = {};
  for (const url in urls) {
    if (urls[url].userID === userID) {
      output[url] = urls[url];
    }
  }
  return output;
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Homepage
app.get('/', (req, res) => {
  const templateVars = {
    users
  };
  res.redirect('/login');
});

// URL Stuff
// this shows the JSON string representing the entire obj
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    newUrls: urlsForUser(req.cookies.user_id, urlDatabase),
    users,
    cookies: req.cookies
  };

  if (!req.cookies.user_id) {
    return res.send('You must be logged in to create URLs!\n');
  }

  console.log(users);

  return res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    return res.send('You must be logged in to create URLs!\n');
  }

  const key = generateRandomString();
  urlDatabase[key] = {};
  urlDatabase[key].longURL = req.body.longURL;

  res.redirect(`/urls/${key}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    cookies: req.cookies
  };

  if (!templateVars.cookies.user_id) {
    res.redirect('/login');
  }

  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    users,
    cookies: req.cookies
  };
  const user = req.cookies.user_id;

  if (!user) {
    return res.status(401).send('Sorry, you must be logged in to view this page.');
  }

  if (user !== urlDatabase[templateVars.id].userID) {
    return res.status(401).send('Sorry, you must have created this link to view this page.');
  }

  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let id = req.params.id;
  const user = req.cookies.user_id;

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
    res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect('/urls');
});


app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;

  if (!longURL) {
    return res.status(404).send('Sorry, that short URL does not exist!');
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  const user = req.cookies.user_id;

  if (!urlDatabase[id]) {
    return res.status(404).send('Sorry, that ID does not exist!\n');
  }

  if (!user) {
    return res.status(401).send('Please login first!\n');
  }

  if (urlDatabase[id].userID !== user) {
    res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login/Logout
app.get('/login', (req, res) => {
  const templateVars = {
    users,
    cookies: req.cookies
  };

  if (templateVars.cookies.user_id) {
    res.redirect('/urls');
  }

  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('Sorry, that account does not exist!');
  }

  if (!bcrypt.compareSync(password, users[user].hashedPw)) {
    res.status(403).send('Sorry, that password is invalid. You have 1 more try, or you will be IP banned from our website.');
  }

  res.cookie('user_id', user);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.cookies["user_id"]);
  res.redirect("/login");
});

// Register
app.get('/register', (req, res) => {
  const templateVars = {
    users,
    cookies: req.cookies
  };

  if (templateVars.cookies.user_id) {
    res.redirect('/urls');
  }

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPw = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('Sorry, please enter a valid email and password.');
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('Sorry, that account already exists!');
  }

  users[userId] = { userId, email, hashedPw };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

