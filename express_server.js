const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
var methodOverride = require('method-override');
const { generateRandomString, checkUserExists, getUserByEmail, checkIfLoggedIn, returnUserURLs, uniqueViews, currentTimeStamp } = require("./helpers");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": {
      longURL: "http://www.lighthouselabs.ca",
      userID: "7npfuk",
      noVists: 2,
      dateCreated: 'Fri, 25 Mar 2022 02:25:40 GMT'
    },
  "9sm5xK": {
      longURL: "http://google.com",
      userID: "user2RandomID",
      noVists: 0,
      dateCreated: 'Fri, 23 Mar 2022 02:25:40 GMT'
    }
};

const visitors = {
  "b2xVn2": {
      casdke: {
        timestamp: ['Thu, 24 Mar 2022 21:42:47 GMT']
      },
      dzxccw: {
        timestamp: ['Thu, 24 Mar 2022 21:42:47 GMT']
      }
   },
   "9sm5xK": {

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
    email: "ryan@a.com", 
    password: "$2a$10$lCqCy3JammInLRHu/yo3OOxcXwqBEoI0TCfwBlS.JYUDc.7eu9y4m"
  },
  "7npfuk": {
    id: "7npfuk",
    email: "ryan@test.com", 
    password: "$2a$10$sx..Jmb8a4pzDg6toVb8LebNxaGbomsKxhm1FJb37pHctKdzgpVse"
  }
};



app.get("/", (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)){
    res.redirect("/urls");
  }
  else{
    res.redirect("login");
  };
});

app.get("/login", (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)) {
    res.redirect("/urls")
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("login", templateVars);
  };
});

app.post("/login", (req, res) => {
  if (checkUserExists(req.body.email, users)) {
    const user = getUserByEmail(req.body.email, users);
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(401).send('Invalid User/Password')
    }
  } else {
    res.status(401).send('Invalid User/Password')
  };
});

app.get("/urls" , (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)) {
    let userURLs = returnUserURLs(req.session.user_id, urlDatabase);
    const templateVars = { 
      urls: userURLs,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
      res.status(401).send(`Please <a href="/login">Login</a>, or <a href="/register">Register</a>`);
  }
});

app.post("/urls", (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)) {
    const shortURL = generateRandomString();
    const dateCreated = currentTimeStamp();
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id, noVists: 0, dateCreated: dateCreated };
    visitors[shortURL] = {};
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).write("Forbidden");
  }
});

app.get("/register", (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)) {
    res.redirect("/urls")
  } else {
    const templateVars = {
    user: users[req.session.user_id]
    }
    res.render("register", templateVars)
  };
});

app.post("/register", (req, res) => {
  if (checkUserExists(req.body.email, users)){
    res.status(400).send('Email Exists');
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Bad Request');
  } else {
    let id = generateRandomString();
    users[id] = {
      id: id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = users[id].id;
    res.redirect("/urls");
  }
});

app.get("/urls/new", (req, res) => {
  if (checkIfLoggedIn(req.session.user_id, users)) {
    const templateVars = {
      user: users[req.session.user_id]
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  };
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).redirect("/404")
  }
  if(!(urlDatabase[req.params.shortURL].userID === req.session.user_id)){
    res.status(401).send("Do not have permission")
  } else {
    const uniqueVisitors = uniqueViews(req.params.shortURL, visitors)
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id],
      views: urlDatabase[req.params.shortURL].noVists,
      visitors: visitors[req.params.shortURL],
      uniqueVisits: uniqueVisitors,
      dateCreated: urlDatabase[req.params.shortURL].dateCreated
    };
    res.render("urls_show", templateVars);
  };
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).redirect("/404")
  } else {
    urlDatabase[req.params.shortURL].noVists += 1;
    let timeStamp = currentTimeStamp();
      if (!req.cookies.visitorId) {
        let visitorId = generateRandomString();
        res.cookie("visitorId", visitorId);
        visitors[req.params.shortURL][visitorId] = {timestamp: [timeStamp]};
      } else {
        if (visitors[req.params.shortURL][req.cookies.visitorId]){
          visitors[req.params.shortURL][req.cookies.visitorId].timestamp.push(timeStamp); 
        } else {
        visitors[req.params.shortURL][req.cookies.visitorId] = {timestamp: [timeStamp]}; 
        };
      };
      const longURL = urlDatabase[req.params.shortURL].longURL;
    if(!(longURL.startsWith('http://')) && !(longURL.startsWith('https://'))) {
      res.redirect(`https://${longURL}`);
    } else {
      res.redirect(`${longURL}`);
    };
  }
});

app.delete("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Do not have permission");
  };
});

app.put("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/404", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("404", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});