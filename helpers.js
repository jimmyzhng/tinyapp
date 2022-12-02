// Check if email exists
const getUserByEmail = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
  return undefined;
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

module.exports = { getUserByEmail, urlsForUser };