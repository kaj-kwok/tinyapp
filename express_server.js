const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { get } = require("http");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "7npfuk"
    },
  "9sm5xK": {
      longURL: "http://google.com",
      userID: "7npfuk"
    }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "7npfuk": {
    id: "7npfuk",
    email: "ryan@ryan.com", 
    password: "test123"
  }
};

function generateRandomString() {
  return Math.random().toString(36).slice(7)
};

function checkUserExists(email, users) {
  for (user in users) {
    if (users[user].email === email){
      return true;
    }
  } return false;
}

function retrieveUser (email, users) {
  for (user in users) {
    if(users[user].email === email){
      return users[user];
    }
  }return false;
}

function checkIfLoggedIn(id, users) {
  for (user in users) {
    if (users[user].id === id){
      return true;
    }
  }return false
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  if(checkUserExists(req.body.email, users)){
    user = retrieveUser(req.body.email, users);
    if(user.password === req.body.password){
      res.cookie("user_id", user.id)
      res.redirect("/urls")
    }
    else{
      res.status(403).send('Invalid User/Password')
    }
  } else {
    res.status(403).send('Invalid User/Password')
  }
})

app.get("/urls" , (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  }
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) => {
  if (checkIfLoggedIn(req.cookies.user_id, users)) {
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = { longURL: req.body.longURL};
  res.redirect(`/urls/${shortURL}`)
  } else {
    res.status(401).write("Forbidden")
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
  user: users[req.cookies.user_id]
  }
  res.render("register", templateVars)
})

app.post("/register", (req, res) => {
  if (req.body.username === "" || req.body.password === "" || checkUserExists(req.body.email, users)){
    res.status(400).send('Bad Request')
  } else {
    let id = generateRandomString()
    users[id] = {
      id: id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", id);
    res.redirect("/urls")
  }
})

app.get("/urls/new", (req, res) => {
  if (checkIfLoggedIn(req.cookies.user_id, users)) {
    const templateVars = {
      user: users[req.cookies.user_id]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.user_id]
  }
  res.render("urls_show", templateVars)
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  console.log(longURL)
  if(!(longURL.startsWith('http://')) && !(longURL.startsWith('https://'))){
    res.redirect(`https://${longURL}`)
  } else{
    res.redirect(`${longURL}`)
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

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});