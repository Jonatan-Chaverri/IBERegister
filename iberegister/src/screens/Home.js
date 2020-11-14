import React, { Component } from 'react'
import Firebase from "firebase"

import firebase_config from "../config"
import HeaderBar from '../components/HeaderBar'
import RegisterForm from '../components/RegisterForm'
import EditReservationForm from '../components/EditReservationComponent'
import FooterBar from '../components/Footer'

import logo from '../images/logo.png'


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
                <HeaderBar
                    highlightReservation={pageType == "reservation"}
                    handleEdit={handleEdit}
                    handleReservation={handleReservation}
                />
                {
                    pageType == "reservation" ? <RegisterForm/> :<EditReservationForm/>
                }
                <FooterBar></FooterBar>
            </div>
        )
    }
}

export default Home