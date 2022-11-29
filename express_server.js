const express = require('express');
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

app.get('/', (req, res) => {
  res.send('hello!');
});

// this shows the JSON string representing the entire obj
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render('urls_show', templateVars);
});


app.post("/urls", (req, res) => {
  const key = generateRandomString();

  urlDatabase[key] = req.body.longURL;
  res.redirect(`/urls/${key}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  // let id = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Helloooooooooo <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Ex app listening on port ${PORT}`);
});

