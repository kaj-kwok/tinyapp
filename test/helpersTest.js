const { assert } = require('chai');
const { getUserByEmail, checkUserExists, returnUserURLs } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
  });
  it('should return false with invalid email', function() {
    const user = getUserByEmail("test@example.com", testUsers)
    const expectedUserID = false;
    assert.equal(user, expectedUserID)
  });
  it('should return true with user exists', function() {
    const user = checkUserExists("user@example.com", testUsers)
    const expected = true;
    assert.equal(user, expected)
  });
  it('should return false if user does not exist', function() {
    const user = checkUserExists("test@example.com", testUsers)
    const expected = false;
    assert.equal(user, expected)
  });
  it('should return a list of URLS that have id as a property', () => {
    urls = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "7npfuk"
      },
    "9sm5xK": {
        longURL: "http://google.com",
        userID: "user2RandomID"
      }
    }
      const returnedURLS = returnUserURLs("user2RandomID", urls);
      expectedURLS = {    
        "9sm5xK": {
        longURL: "http://google.com",
        userID: "user2RandomID"
        }
      }
    assert.deepEqual(returnedURLS, expectedURLS)
    });
  it('should return no URLS that have id as a property', () => {
    urls = {
      "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "7npfuk"
      },
    "9sm5xK": {
        longURL: "http://google.com",
        userID: "user2RandomID"
      }
    }
      const returnedURLS = returnUserURLs("333223", urls);
      expectedURLS = {};
    assert.deepEqual(returnedURLS, expectedURLS)
    });
});