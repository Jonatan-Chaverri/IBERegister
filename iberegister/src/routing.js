import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import { Home, Admin, Login } from './screens'

import { AUTH_EXPIRES_IN } from './constants'


const PrivateRoute = ({ component: Component, ...rest }) => {

  // Add your own authentication on the below line.
  const isLoggedIn = localStorage.getItem(AUTH_EXPIRES_IN) ?
      localStorage.getItem(AUTH_EXPIRES_IN) >= new Date().getTime() : false

  return (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  )
}


export default function App() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home pageType="reservation"/> 
          </Route>
          <PrivateRoute exact path="/admin" component={Admin}/>
          <Route exact path="/login">
            <Login/>
          </Route>
        </Switch>
      </BrowserRouter>
    )
}
