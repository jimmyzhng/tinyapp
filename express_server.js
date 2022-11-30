const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // runs the next callback
});

app.get('/', (req, res) => {
  res.send('hello!');
});

// this shows the JSON string representing the entire obj
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
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
    username: req.cookies["username"]
  };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
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

app.post("/login", (req, res) => {
  // console.log(req.body);
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.cookies["username"]);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

