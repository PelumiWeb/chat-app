const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAT: new Date().getTime(),
  };
};
const generateLocation = (username, url) => {
  return {
    username,
    url,
    createdAT: new Date().getTime(),
  };
};
module.exports = {
  generateMessage,
  generateLocation,
};
