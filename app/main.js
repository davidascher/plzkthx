/** @jsx React.DOM */

var React = require('react');
var app = require('./app.js');
var RepoApp = require('./repos.js');
var GithubLogin = require('./githublogin.js')


function startup() {
  React.render(<GithubLogin/>, document.getElementById('githublogin'));
  React.render(<RepoApp/>, document.getElementById('repos'));
  app.setup();
}

function updateHandle() {
  app.updateHandle();
}

window.addEventListener('DOMContentLoaded', startup, false);
