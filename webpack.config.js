const path = require('path');

module.exports = {
  entry: path.join(__dirname, './src/injected.js'),
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js'
  }
};
