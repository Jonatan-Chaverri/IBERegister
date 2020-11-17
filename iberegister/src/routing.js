import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Home, Admin } from './screens'

export default function App() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home pageType="reservation"/> 
          </Route>
          <Route exact path="/admin">
            <Admin/> 
          </Route>
        </Switch>
      </BrowserRouter>
    )
}