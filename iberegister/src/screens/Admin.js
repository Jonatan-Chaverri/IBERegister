import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import firebase_config from "../config"

import CustomDatePicker from '../components/CustomDatePicker'
import ReservationsDisplay from '../components/ReservationsDisplay'
import {FaTimesCircle } from 'react-icons/fa'

import {ADMIN_USER, ADMIN_PASSWORD} from '../config'
import {nextAvailableDate} from '../utils'


class Admin extends Component {

    constructor(props){
        super(props)

        Firebase.initializeApp(firebase_config)

        this.state = {
            isLoggedIn: false,
            user: "",
            password: "",
            reservationDate: nextAvailableDate(new Date()),
            reservations: {},
            errorMessage: ""
        }

        this.handleDateChange = this.handleDateChange.bind(this)
        this.handleUserChange = this.handleUserChange.bind(this)
        this.handlePassChange = this.handlePassChange.bind(this)
        this.handleClickValidate = this.handleClickValidate.bind(this)
    }

    handleDateChange(selectedDate){
        let ref = Firebase.database().ref(`/${selectedDate}`)

        ref.on('value', snapshot => {
            var reservations = snapshot.val();
            if (reservations == null) {
                reservations = {}
            }
            this.setState({
                reservationDate: selectedDate,
                reservations: reservations
            })
        })
    }

    handleUserChange(event){
        this.setState({
            user: event.target.value
        })
    }

    handlePassChange(event){
        this.setState({
            password: event.target.value
        })
    }

    handleClickValidate(event){
        const {user, password, reservationDate} = this.state
        const {handleDateChange}= this
        if (user === ADMIN_USER && password === ADMIN_PASSWORD){
            handleDateChange(reservationDate)
            this.setState({
                errorMessage: "",
                isLoggedIn: true
            })
            return
        }
        this.setState({
            errorMessage: "Datos invalidos"
        })
    }

    render(){
        const {reservationDate, user, isLoggedIn, password, reservations, errorMessage} = this.state
        const {handleDateChange, handleUserChange, handlePassChange, handleClickValidate} = this
        return(
            <div>
                <div class="topnav">
                    <label> IBE Admin</label>
                </div>
                <div class="registerForm">
                    <div class="custom-header-text">Iniciar Sesion</div>
                    <table>
                        <tr>
                            <th>Usuario</th>
                            <th>
                            <div className="input-error">
                                <input 
                                    type="text"
                                    className="text-input"
                                    value={user}
                                    disabled={isLoggedIn}
                                    onChange={handleUserChange}
                                />
                            </div>
                            </th>
                        </tr>
                        <tr>
                            <th>Contrasena</th>
                            <th>
                            <div className="input-error">
                                <input 
                                    type="password"
                                    className="text-input"
                                    value={password}
                                    disabled={isLoggedIn}
                                    onChange={handlePassChange}
                                />
                            </div>
                            </th>
                        </tr>
                    </table>
                    <div className="main-block">
                        <input 
                            class="button-add-reserve"
                            type="button"
                            value="Validar"
                            disabled={isLoggedIn}
                            onClick={handleClickValidate}/>
                    </div>
                    <div class="error-message">
                    {
                        errorMessage ?
                            <div>{errorMessage} <FaTimesCircle class="icon-fail-circle"/></div>
                             : <div>&nbsp;</div>
                    }
                    </div>
                    {
                        isLoggedIn ?
                        <div>
                            <div class="date-selection-block">
                                <CustomDatePicker 
                                    selectedDate={reservationDate}
                                    onDateSelected={event => handleDateChange(event.target.value)}
                                    disabled={!isLoggedIn}
                                />
                            </div> 
                            <ReservationsDisplay reservations={reservations}/>
                        </div>: <div class="date-selection-block"> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }
}

export default Admin