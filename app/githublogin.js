/** @jsx React.DOM */

var React = require('react');
var readCookie  = require('./readcookie.js');
var GitHubPerson = require('./githubperson.js');

var GithubLogin = React.createClass({
  render: function() {
    var user = readCookie('githubuser');
    if (user) {
      return (
        <div className="loggedinuser">
          <GitHubPerson handle={user}/>
          <a className="linkbutton" href="/logout">sign out</a>
        </div>
      );
    } else {
      return (
        <div className="loggedinuser">
          <a className="linkbutton" href="/login">sign in</a>
        </div>
      );
    }
  }
});

module.exports = GithubLogin;
