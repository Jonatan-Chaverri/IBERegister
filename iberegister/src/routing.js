import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Home, Admin, Conferencia } from './screens'

export default function App() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <Home pageType="reservation"/>
          </Route>
          <Route exact path="/conferencia">
            <Conferencia pageType="reservation"/>
          </Route>
          <Route exact path="/admin">
            <Admin/>
          </Route>
        </Switch>
      </BrowserRouter>
    )
}
