import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'

import firebase_config from "../config"
import HeaderBar from '../components/HeaderBar'
import ConferenciaRegisterForm from '../components/ConferenciaRegisterForm'
import ConferenciaEditReservation from '../components/ConferenciaEditReservation'
import FooterBar from '../components/Footer'

import logo from '../images/logo.png'

import {HEADERNAME, HEADERSUBTITLE} from '../constants'


class Home extends Component {
    constructor(props){
        super(props)
        this.state = {
            pageType: "reservation"
        }
        Firebase.initializeApp(firebase_config)
        this.handleReservation = this.handleReservation.bind(this)
        this.handleEdit = this.handleEdit.bind(this)
    }

    handleReservation(){
        this.setState({
            pageType: "reservation"
        })
    }

    handleEdit(){
        this.setState({
            pageType: "edit"
        })
    }

    render() {
        const {pageType} = this.state
        const {handleEdit, handleReservation} = this
        return (
            <div className="main">
                <div className='header-layout'>
                    <div className='header-data'>
                        <div className='header-photo'>
                            <img src={logo} alt="logo" width="100%" height="100%"/>
                        </div>
                        <div className='header-text'>
                            <p className='header-name'>{HEADERNAME}</p>
                            <p className='header-location'>{HEADERSUBTITLE}</p>
                        </div>
                    </div>
                </div>
                <HeaderBar
                    highlightReservation={pageType === "reservation"}
                    handleEdit={handleEdit}
                    handleReservation={handleReservation}
                />
                {
                    pageType === "reservation" ? <ConferenciaRegisterForm/> : <ConferenciaEditReservation/>
                }
                <FooterBar></FooterBar>
            </div>
        )
    }
}

export default Home
