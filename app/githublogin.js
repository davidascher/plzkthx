/** @jsx React.DOM */

var React = require('react');
var readCookie  = require('./readcookie.js');

var GithubLogin = React.createClass({
  render: function() {
    var user = readCookie('githubuser');
    if (user) {
      return (
        <div>
          <a href="/logout">{user}</a>
        </div>
      );
    } else {
      return (
        <div>
          <a href="/login">sign in</a>
        </div>
      );
    }
  }
});

module.exports = GithubLogin;
