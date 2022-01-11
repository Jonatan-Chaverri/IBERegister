import React, { Component } from 'react'

import Firebase from "firebase/app"

import FooterBar from '../components/Footer'
import HeaderBar from '../components/HeaderBar'
import RegisterForm from '../components/RegisterForm'
import EditReservationForm from '../components/EditReservationComponent'

import logo from '../images/logo.png'

import { HEADERNAME, HEADERSUBTITLE } from '../strings'


class Home extends Component {

    constructor(props){
        super(props)
        this.state = {
            pageType: "reservation",
            defaultCapacity: 0
        }
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

    componentDidMount(){
        Firebase.database().ref("/settings").on('value', snapshot => {
            const settings = snapshot.val();
            this.setState({
                defaultCapacity: settings.capacity
            })
        })
    }

    render() {
        const { pageType, defaultCapacity } = this.state
        const { handleEdit, handleReservation } = this
        return (
            <div>
                <div className='header-layout'>
                        <div className='header-img-container'>
                            <img src={ logo } alt="logo" className="header-img"/>
                        </div>
                        <div className='header-text'>
                            <p className='header-name'>{ HEADERNAME }</p>
                            <p className='header-location'>
                                { HEADERSUBTITLE }
                            </p>
                        </div>
                </div>
                <HeaderBar
                    highlightReservation={ pageType === "reservation" }
                    handleEdit={ handleEdit }
                    handleReservation={ handleReservation }
                />
                {
                    pageType === "reservation" ?
                    <RegisterForm defaultCapacity={ defaultCapacity }/> :
                    <EditReservationForm defaultCapacity={ defaultCapacity }/>
                }
                <FooterBar></FooterBar>
            </div>
        )
    }
}

export default Home
