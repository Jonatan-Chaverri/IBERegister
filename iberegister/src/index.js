import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import App from './routing';

import { Home } from './screens'

import './index.css'

//ReactDOM.render(<App />, document.getElementById('root'))
ReactDOM.render(<Home/>, document.getElementById('root'))