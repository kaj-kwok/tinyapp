const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

function generateRandomString() {
  return Math.random().toString(36).slice(7)
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
} )

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls" , (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username
  }
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`)
})

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  console.log(req.body)
})

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies.username
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  }
  res.render("urls_show", templateVars)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  if(!longURL.startsWith('http://') || !longURL.startsWith('https://')){
    res.redirect(`https://${longURL}`)
  } else{
    res.redirect(longURL)
  }
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls")
})

app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username)
  console.log(res.cookie)
  res.redirect("/urls")
})

app.post("/urls/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});