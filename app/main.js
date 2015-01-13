/** @jsx React.DOM */

var React = require('react');
var app = require('./app.js');
var GithubLogin = require('./githublogin.js')


function startup() {
  React.render(<GithubLogin/>, document.getElementById('githublogin'));
  app.setup();
}

function updateHandle() {
  app.updateHandle();
}

window.addEventListener('DOMContentLoaded', startup, false);
