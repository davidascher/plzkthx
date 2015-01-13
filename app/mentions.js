/** @jsx React.DOM */

var React = require('react');
var ReactFireMixin = require('reactfire');
var Firebase = require('client-firebase')
var readCookie  = require('./readcookie.js');
var getJSON = require('./getJSON.js');

var GitHubPerson = React.createClass({
  getInitialState: function() {
    // We are given a github name
    return {
      username: '',
      name: '',
      avatar_url: ''
    };
  },

  componentDidMount: function() {
    var handle = this.props.handle.toLowerCase();
    var that = this;
    getJSON('/api/user/'+handle, function(data) {
      if (data.avatar_url.indexOf('?') != -1) {
        data.avatar_url = data.avatar_url + '&s=32';
      } else {
        data.avatar_url = data.avatar_url + '?s=32';
      }
      if (that.isMounted()) {
        that.setState({
        username: data.login,
        avatar_url: data.avatar_url,
        name: data.name
      });
      }
    }, function(error, data) {
      console.log("GOT ERROR", error, data)
    })
  },

  render: function() {
    var name = this.props.handle;
    return (
      <a href={this.state.html_url} title={this.state.name}>
        <img className="avatar" src={this.state.avatar_url}/>
      </a>);
  }
});

var Mention = React.createClass({
  getInitialState: function() {
    return {"issueState": "open"};
  },
  componentDidMount: function() {
    console.log(this.props.comment);
    var comp = this;
    var issuesRef = new Firebase("https://debt.firebaseio.com/issues").child(this.props.comment.issue_id).on('value', 
      function(snapshot) {
        issue = snapshot.val();
        console.log(issue);
        comp.setState({"issueState": issue.state})
      })
    // get info from the issues firebase and set some properties based on that
  },
  dismiss: function(fbid) {
    var firebaseRef = new Firebase("https://debt.firebaseio.com/asks").child(fbid).update({'dismissed': 'true'});
  },
  render: function() {
    comment = this.props.comment;
    var className = this.state.issueState == "closed" ? "hidden" : ""
    if (this.props.question == 'mention') {
      var loggedinUser = readCookie('githubuser');
      var dismiss = this.dismiss.bind(this, this.props.issue_id);
      if (loggedinUser == this.props.handle) {
        trashcan = <a className="dismiss" href="#" onClick={dismiss}><i className="fa fa-trash" ></i></a>;
      } else {
        trashcan = <span/>
      }
      if (! comment.dismissed) {
        return <li className={className}>
                  <GitHubPerson handle={comment.fromwhom}/>
                  <b>@{comment.fromwhom }</b>
                  mentioned @{this.props.handle} in issue 
                  <a href={comment.ref_html_url}>{comment.issue}</a>
                    {trashcan}
                </li>
      } else {
        return <span></span>
      }
    } else {
      return(<li className={className}>
                <GitHubPerson handle={comment.fromwhom }/>
                <b>{comment.fromwhom }</b> asked for <b>{comment.question}</b> on issue
                <a href={comment.ref_html_url}>{comment.issue}</a>
              </li>);
    }
  }
})

var MentionsList = React.createClass({
  render: function() {
    var bits = [];
    var mentions = this.props.mentions
    for (var fromwhom in mentions) {
      // looking at the asks from 'fromwhom'
      if (! mentions.hasOwnProperty(fromwhom)) continue;
      tomefromthem = mentions[fromwhom];
      // tomefromthem will be the same 
      for (var question in tomefromthem) {
        if (! tomefromthem.hasOwnProperty(question)) continue;
        for (var issue_id in tomefromthem[question]) {
          if (! tomefromthem[question].hasOwnProperty(issue_id)) continue;
          comment = tomefromthem[question][issue_id];
          if (comment.type != this.props.type) continue;
          var unique_id = this.props.handle+'/'+fromwhom+'/'+question+'/'+comment.issue_id;
          bits.push(<Mention key={unique_id} issue_id={unique_id} handle={this.props.handle} question={question} comment={comment}/>)
        }
      }
    }
    if (bits.length > 0) {
      return (<ul> {bits} </ul>);
    } else {
      return (<div>No outstanding {this.props.type}s</div>);
    }
  }
});

var MentionsApp = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {handle: this.props.handle};
  },

  componentWillMount: function() {
    var firebaseRef = new Firebase("https://debt.firebaseio.com/asks").child(this.state.handle);
    this.bindAsObject(firebaseRef, "mentions");
  },

  onChange: function(e) {
    this.setState({handle: e.target.value});
  },

  render: function() {
    return (
      <MentionsList type={this.props.type} handle={this.props.handle} mentions={this.state.mentions}/>
    );
  }
});


module.exports = MentionsApp;
