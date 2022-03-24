//generate random ID
const generateRandomString = () => {
  return Math.random().toString(36).slice(7)
};

const checkUserExists = function(email, users) {
  for (user in users) {
    if (users[user].email === email){
      return true;
    }
  } return false;
}

const getUserByEmail = function(email, users) {
  for (user in users) {
    if(users[user].email === email){
      return users[user];
    }
  }return false;
}

const checkIfLoggedIn = function(id, users) {
  for (user in users) {
    if (users[user].id === id){
      return true;
    }
  }return false
}

const returnUserURLs = function(userid, urlDatabase) {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === userid){
      urls[url] = urlDatabase[url]
    }
  } return urls;
}

module.exports = { generateRandomString, checkUserExists, getUserByEmail , checkIfLoggedIn, returnUserURLs}