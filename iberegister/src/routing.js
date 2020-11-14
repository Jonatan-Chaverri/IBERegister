import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Home } from './screens'

export default function App() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home pageType="reservation"/> 
          </Route>
        </Switch>
      </BrowserRouter>
    )
}