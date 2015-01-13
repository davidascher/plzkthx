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
        data.avatar_url = data.avatar_url + '&s=64';
      } else {
        data.avatar_url = data.avatar_url + '?s=64';
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
      <div className="profile-pic-wrap">
        <div className="profile-pic">
          <a href={this.state.html_url} title={this.state.name}>
            <img className="profile-pic-btn" src={this.state.avatar_url}/>
          </a>
        </div>
      </div>
      );
  }
});

var Mention = React.createClass({
  getInitialState: function() {
    return {"issueState": "open", "issueTitle": ""};
  },
  componentDidMount: function() {
    var comp = this;
    var issuesRef = new Firebase("https://debt.firebaseio.com/issues").child(this.props.comment.issue_id).on('value', 
      function(snapshot) {
        issue = snapshot.val();
        if (issue)
          comp.setState({"issueState": issue.state, "issueTitle": issue.title})
      })
    // get info from the issues firebase and set some properties based on that
  },
  dismiss: function(fbid) {
    var firebaseRef = new Firebase("https://debt.firebaseio.com/asks").child(fbid).update({'dismissed': 'true'});
  },
  parseBody: function(body) {
    if (!body) return <span/>;
    var mentionIndex = body.indexOf("@"+this.props.handle);
    var beginning = Math.max(0, mentionIndex - 50);
    var ending = Math.min(mentionIndex+("@"+this.props.handle).length + 50, body.length);
    var before = body.slice(beginning, mentionIndex);
    var after = body.slice(mentionIndex + ("@"+this.props.handle).length, ending);
    return <span>{before}<b>@{this.props.handle}</b>{after}</span>;
  },
  render: function() {
    comment = this.props.comment;
    var className = this.state.issueState == "closed" ? "mention hidden" : "mention"
    if (this.props.question == 'mention') {
      var loggedinUser = readCookie('githubuser');
      var dismiss = this.dismiss.bind(this, this.props.issue_id);
      if (loggedinUser == this.props.handle) {
        trashcan = <a className="dismiss" href="#" onClick={dismiss}><i className="fa fa-trash" ></i></a>;
      } else {
        trashcan = <span/>
      }
      if (!comment.body) {
        console.log("WTF", comment);
      }
      var parsedBody = this.parseBody(comment.body);
      if (! comment.dismissed) {
        return <li className={className}>
                  <GitHubPerson handle={comment.fromwhom}/>
                  <p className="mentionblock">
                    <div>In <a href={comment.ref_html_url}>{this.state.issueTitle}</a>:</div>
                    {trashcan}
                    <div className="comment">{parsedBody}</div>
                  </p>
                </li>
      } else {
        return <span></span>
      }
    } else {
      return(<li className={className}>
                <GitHubPerson handle={comment.fromwhom }/>
                <p className="mentionblock">
                  <b>{comment.fromwhom }</b> asked for <b>{comment.question}</b> in <a href={comment.ref_html_url}>{this.state.issueTitle}</a>
                </p>
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
      return (<div><h3>{this.props.title}</h3>
                   <ul className="mentionsul"> {bits} </ul>
              </div>); 
    } else {
      return (<div></div>);
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
      <div>
        <MentionsList title="Pending Flags" type="flag" handle={this.props.handle} mentions={this.state.mentions}/>
        <MentionsList title="Pending Mentions" type="mention" handle={this.props.handle} mentions={this.state.mentions}/>
      </div>
    );
  }
});


module.exports = MentionsApp;
