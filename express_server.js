const express = require('express');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');

const helpers = require('./helpers.js');
const data = require('./data.js');

app.set('view engine', 'ejs');

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
    urls: data.urlDatabase,
    newUrls: helpers.urlsForUser(req.session.user_id, data.urlDatabase),
    users: data.users,
    cookies: req.session
  };

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
  const key = helpers.generateRandomString();

  data.urlDatabase[key] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visitCount: 0,
    uniqueVisitors: []
  };

  console.log(data.urlDatabase);

  return res.redirect(`/urls/${key}`);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users: data.users,
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
    longURL: data.urlDatabase[req.params.id].longURL,
    users: data.users,
    cookies: req.session
  };
  const user = req.session.user_id;

  if (!user) {
    return res.status(401).send('Sorry, you must be logged in to view this page.');
  }

  if (user !== data.urlDatabase[templateVars.id].userID) {
    return res.status(401).send('Sorry, you must have created this link to view this page.');
  }

  return res.render('urls_show', templateVars);
});

// Editing URL
app.put('/urls/:id', (req, res) => {
  let id = req.params.id;
  const user = req.session.user_id;

  // id does not exist
  if (!data.urlDatabase[id]) {
    return res.status(404).send('Sorry, that ID does not exist!\n');
  }
  // user not logged in
  if (!user) {
    return res.status(401).send('Please login first!\n');
  }
  // user does not own url
  if (data.urlDatabase[id].userID !== user) {
    return res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }

  data.urlDatabase[id].longURL = req.body.longURL;
  return res.redirect('/urls');
});

// Short URL redirecting to Long URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = data.urlDatabase[id].longURL;
  const user = req.session.user_id;

  if (!longURL) {
    return res.status(404).send('Sorry, that short URL does not exist!');
  }

  if (!data.urlDatabase[id].uniqueVisitors.includes(user)) {
    data.urlDatabase[id].uniqueVisitors.push(user);
  }

  data.urlDatabase[id].visitCount += 1;

  return res.redirect(longURL);
});

// Deleting URL
app.delete("/urls/:id", (req, res) => {
  let id = req.params.id;
  const user = req.session.user_id;

  if (!data.urlDatabase[id]) {
    return res.status(404).send('Sorry, that ID does not exist!\n');
  }

  if (!user) {
    return res.status(401).send('Please login first!\n');
  }

  if (data.urlDatabase[id].userID !== user) {
    return res.status(401).send('Sorry, that short URL does not belong to you!\n');
  }

  delete data.urlDatabase[id];
  res.redirect("/urls");
});

// Login/Logout
app.get('/login', (req, res) => {
  const templateVars = {
    users: data.users,
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
  const user = helpers.getUserByEmail(email, data.users);

  if (!user) {
    return res.status(400).send('Sorry, that account does not exist!');
  }

  if (!bcrypt.compareSync(password, data.users[user].hashedPw)) {
    return res.status(403)
      .send(`Sorry, that password is invalid. You have 1 more attempt, or you will be IP banned from our website. <br/> <br/> <br/> (Just kidding.)`);
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
    users: data.users,
    cookies: req.session
  };

  if (templateVars.cookies.user_id) {
    return res.redirect('/urls');
  }

  return res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = helpers.generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPw = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('Sorry, please enter a valid email and password.');
  }

  if (helpers.getUserByEmail(email, data.users)) {
    return res.status(400).send('Sorry, that account already exists. Hope you did not forget your password, because we do not have a function for that yet!');
  }

  data.users[userId] = { userId, email, hashedPw };
  req.session.user_id = userId;
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

