import React, { Component } from 'react'
import Firebase from "firebase"

import firebase_config from "../config"
import HeaderBar from '../components/HeaderBar'
import RegisterForm from '../components/RegisterForm'
import FooterBar from '../components/Footer'

import logo from '../images/logo.png'


class Home extends Component {
    constructor(props){
        super(props)
        Firebase.initializeApp(firebase_config)
    }

    render() {
        return (
            <div class="main">
                <div className='header-layout'>
                    <div className='header-data'>
                        <div className='header-photo'>
                            <img src={logo} alt="logo" width="100%" height="100%"/>
                        </div>
                        <div className='header-text'>
                            <p className='header-name'>Iglesia Bautista Emmanuel</p>
                            <p className='header-location'>San Jose, CR</p>
                        </div>
                    </div>
                </div>
                <HeaderBar></HeaderBar>
                <RegisterForm/>
                <FooterBar></FooterBar>
            </div>
        )
    }
}

export default Home