import React, { Component } from 'react'
import Firebase from "firebase"

import firebase_config from "../config"
import HeaderBar from '../components/HeaderBar'
import RegisterForm from '../components/RegisterForm'


class Home extends Component {
    constructor(props){
        super(props)
        Firebase.initializeApp(firebase_config)
    }

    render() {
        return (
            <div class="main">
                <div className='header-layout'></div>
                <HeaderBar></HeaderBar>
                <RegisterForm/>
            </div>
        )
    }
}

export default Home