import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'

import Firebase from "firebase/app";
import "firebase/auth";
import { FaTimesCircle } from 'react-icons/fa'

import {
  UNAUTHORIZED_STATE,
  WAITING_STATE,
  AUTH_MAIL,
  AUTH_APIKEY,
  AUTH_REFRESH_TOKEN,
  AUTH_EXPIRES_IN
} from '../constants'

import {
  INVALID_USER_NAME,
  UNAUTHORIZED_USER,
  WRONG_PASSWORD,
  VALIDATE_BUTTON
} from '../strings'


class Login extends Component {

   constructor(props){
        super(props)
        this.state = {
          user: "",
          password: "",
          loginState: UNAUTHORIZED_STATE,
          errorMessages: {
            userNotValid: false,
            userNotFound: false,
            incorrectPass: false
          }
        }

        this.handleLogin = this.handleLogin.bind(this)
        this.handleUserChange = this.handleUserChange.bind(this)
        this.handlePassChange = this.handlePassChange.bind(this)
        this.parseErrorMessages = this.parseErrorMessages.bind(this)
        this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /*
   * Callback for "login" button. Performs authentication against firebase
   * auth service
   */
  handleLogin(){
    const { location } = this.props
    const { user, password, errorMessages } = this.state

    Firebase.auth().signInWithEmailAndPassword(user, password).then(raw_data => {
      const data = JSON.parse(JSON.stringify(raw_data))
      // Store session
      localStorage.setItem(AUTH_MAIL, data.user.email)
      localStorage.setItem(AUTH_APIKEY, data.user.stsTokenManager.apiKey)
      localStorage.setItem(
        AUTH_REFRESH_TOKEN, data.user.stsTokenManager.refreshToken
      )
      localStorage.setItem(
        AUTH_EXPIRES_IN, data.user.stsTokenManager.expirationTime
      )
      var newLocation = '/admin'
      if (location.state){
        newLocation = location.state.from.pathname
      }
      this.props.history.push(newLocation)
    }).catch(error => {
      if (error.code === "auth/invalid-email"){
        errorMessages.userNotValid = true
      } else {
        errorMessages.userNotValid = false
      }

      if (error.code === "auth/user-not-found"){
        errorMessages.userNotFound = true
      } else {
        errorMessages.userNotFound = false
      }

      if (error.code === "auth/wrong-password"){
        errorMessages.incorrectPass = true
      } else {
        errorMessages.incorrectPass = false
      }

      this.setState({
        loginState: UNAUTHORIZED_STATE,
        errorMessages: errorMessages
      })
    })

    this.setState({
      loginState: WAITING_STATE
    })
  }

  /*
   * Callback function for username input change
   */
  handleUserChange(event){
      this.setState({
          user: event.target.value
      })
  }

  /*
   * Callback function for password input change
   */
  handlePassChange(event){
      this.setState({
          password: event.target.value
      })
  }

  handleKeyPress(event){
    const { handleLogin } = this

    // if user press enter key
    if (event.charCode === 13){
      handleLogin()
    }
  }

  /*
   * Parses error flags into error messages to be shown to the user
   */
  parseErrorMessages(){
    const { errorMessages } = this.state
    if (errorMessages.userNotValid){
      return INVALID_USER_NAME
    }
    if (errorMessages.userNotFound){
      return UNAUTHORIZED_USER
    }
    if (errorMessages.incorrectPass){
      return WRONG_PASSWORD
    }
    return ""
  }

  render (){
    const { user, password, loginState } = this.state
    const {
      handleLogin,
      handleUserChange,
      handlePassChange,
      parseErrorMessages,
      handleKeyPress
    } = this

    return (
      <div className="login">
        <div className="login__block">
          <div className="login__title">
              <label>IBE Admin</label>
          </div>
          <div className="login__input-block">
              <div className="section-title">Ingresar</div>
              <div>
                  <div>
                      <div className="login__subtitle-block">Usuario</div>
                      <div className="login__text-input-block ">
                          <input
                              type="text"
                              className="text-input"
                              value={ user }
                              onChange={ handleUserChange }
                          />
                      </div>
                  </div>
                  <div>
                      <div className="login__subtitle-block">Contraseña</div>
                      <div className="login__text-input-block ">
                          <input
                              type="password"
                              className="text-input"
                              value={ password }
                              onChange={ handlePassChange }
                              onKeyPress={ handleKeyPress }
                          />
                      </div>
                  </div>
              </div>
          </div>
          <div>
              <input
                  class="button-add-reserve"
                  type="button"
                  value={ VALIDATE_BUTTON }
                  onClick={ handleLogin }
              />
          </div>
          <div className="login__result-block">
          {
              parseErrorMessages() && loginState === UNAUTHORIZED_STATE ?
                  <div>
                    { parseErrorMessages() } <FaTimesCircle class="icon-fail-circle"/>
                  </div>: <div></div>
          }
          </div>
          {
            loginState === WAITING_STATE ?
            <div>Autenticando...</div>: <div></div>
          }
        </div>
    </div>
    )
  }
}

export default withRouter(Login);
