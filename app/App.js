/** @jsx React.DOM */


var React = require('react');
var MentionsApp = require('./mentions.js');
var readCookie  = require('./readcookie.js');

function whichUser() {

  if (window.location.pathname.indexOf('/u/') == 0) {
    var re = /^\/u\/(\w*)$/i;
    matches = window.location.pathname.split(re);
    if (matches.length) {
      return matches[1]; // the username
    }
  }
  
 // if we're signed in and we're looking at the home page, show our stuff
  var user = readCookie('githubuser');
  if (user)  {
    return user;
  }
  // if we're not signed up, be blank
  return '';
}

function setup() {
  var handleVal= whichUser();
  updateData(handleVal);
}

function updateData(handleVal) {
  var handle = document.getElementById("handle")
  handle.value = handleVal;
  var obligations = document.getElementById('obligations');
  obligations.innerHTML = '';
  var mentions = document.getElementById('mentions');
  mentions.innerHTML = '';
  React.render(
    <MentionsApp handle={handleVal} type="flag"/>, 
    obligations
  );
  React.render(
    <MentionsApp handle={handleVal} type="mention"/>, 
    mentions
  );
}

function refresh() {
  var handle = document.getElementById("handle")
  updateData(handle.value);
  var stateObj = { };
  history.pushState(stateObj, handle.value, "/u/"+ handle.value);

}

function updateHandle(event) {
  if (event.keyCode != 13) return;
  refresh();
}
window.updateHandle = updateHandle;

module.exports = {
  'setup': setup,
  'updateHandle': updateHandle
};
