/*
 * IBEregister entrypoint
 * Author: jonathan.chaverri12@gmail.com
 */
import React from 'react';
import ReactDOM from 'react-dom'

import Firebase from "firebase/app"
import firebase_config from "./config"

import App from './routing';

import './index.css'

// Initialize firebase app
Firebase.initializeApp(firebase_config)

// Render routing components
ReactDOM.render(<App />, document.getElementById('root'))
