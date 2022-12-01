const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const users = {
  jimmyzhng: {
    id: "jimmyzhng",
    email: "jimmyzhang1@hotmail.com",
    password: "123450",
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
  console.log(templateVars);
  console.log(req.cookies);
  res.send('hello!');
});

// URL Stuff
// this shows the JSON string representing the entire obj
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users,
    cookies: req.cookies
  };

  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const key = generateRandomString();
  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users,
    cookies: req.cookies
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    users,
    cookies: req.cookies
  };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  let id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls');
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Login/Logout
app.get('/login', (req, res) => {
  const templateVars = {
    users,
    cookies: req.cookies
  };
  res.render('urls_login', templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('Sorry, that account does not exist!');
  }

  if (password !== users[user].password) {
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
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Sorry, please enter a valid email and password.');
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send('Sorry, that account already exists!');
  }

  users[userId] = { userId, email, password };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

