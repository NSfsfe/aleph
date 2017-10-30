import React, {Component} from 'react';
import {connect} from 'react-redux'
import PasswordLogin from "../components/PasswordLogin";
import OAuthLogin, {handleOAuthCallback} from "../components/OAuthLogin";
import Callout from "../components/Callout";
import {login} from "../actions/sessionActions";
import {Redirect, withRouter} from "react-router";
import {showErrorToast, showSuccessToast} from "../components/Toast";
import messages from "../messages";
import {injectIntl} from "react-intl";

class LoginScreen extends Component {
  constructor() {
    super();
    this.login = this.login.bind(this);
  }

  login(token) {
    const {dispatch, intl} = this.props;
    try {
      dispatch(login(token));
      showSuccessToast(intl.formatMessage(messages.status.success));
    } catch (e) {
      console.error("invalid login token", e);
      showErrorToast(intl.formatMessage(messages.status.unknown_error))
    }
  }

  componentWillMount() {
    handleOAuthCallback(this.login);
  }

  componentWillReceiveProps(nextProps) {
    const {session, history} = nextProps;
    if (session.loggedIn) {
      history.push('/');
    }
  }

  render() {
    const {metadata, intl, session} = this.props;
    const passwordLogin = metadata.auth.password_login;
    const oauthLogin = Array.isArray(metadata.auth.oauth) && metadata.auth.oauth.length > 0;

    if (session.loggedIn) {
      return <section>
        <Callout modifier="primary"
                 title={intl.formatMessage(messages.login.already_logged_in.title)}
                 desc={intl.formatMessage(messages.login.already_logged_in.desc)}/>
        <Redirect to="/"/>
      </section>;
    }

    if (!passwordLogin && !oauthLogin) {
      return <Callout modifier="warning"
                      title={intl.formatMessage(messages.login.not_available.title)}
                      desc={intl.formatMessage(messages.login.not_available.desc)}/>;
    }

    return <section>
      {passwordLogin && <PasswordLogin authMetadata={metadata.auth} onLogin={this.login}/>}

      <hr/>

      {oauthLogin && <OAuthLogin providers={metadata.auth.oauth} onLogin={this.login}/>}
    </section>
  }
}

const mapStateToProps = (state) => ({session: state.session, metadata: state.metadata});
export default connect(mapStateToProps)(withRouter(injectIntl(LoginScreen)));
