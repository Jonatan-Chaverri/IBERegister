import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import firebase_config from "../config"

import CustomDatePicker from '../components/CustomDatePicker'
import ReservationsDisplay from '../components/ReservationsDisplay'
import {FaTimesCircle } from 'react-icons/fa'

import {ADMIN_USER, ADMIN_PASSWORD} from '../config'
import {nextAvailableDate, getCurrentWeek} from '../utils'


class Admin extends Component {

    constructor(props){
        super(props)

        Firebase.initializeApp(firebase_config)

        const currentWeekInfo = getCurrentWeek()
        this.currentWeekId = Object.keys(currentWeekInfo)[0]
        const datesOptions = Object.keys(currentWeekInfo[this.currentWeekId]).map(dayId =>{
            return currentWeekInfo[this.currentWeekId][dayId].label
        })

        this.state = {
            isLoggedIn: false,
            user: "",
            password: "",
            currentWeekReservations: {},
            currentWeek: currentWeekInfo,
            reservationDate: datesOptions[0],
            datesOptions: datesOptions,
            reservations: {},
            errorMessage: ""
        }

        this.handleDateChange = this.handleDateChange.bind(this)
        this.handleUserChange = this.handleUserChange.bind(this)
        this.handlePassChange = this.handlePassChange.bind(this)
        this.handleClickValidate = this.handleClickValidate.bind(this)
    }

    handleDateChange(selectedDate){
        // Find id of selected date
        this.setState({
            reservationDate: selectedDate
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
        const {user, password} = this.state
        const {currentWeekId}= this
        if (user === ADMIN_USER && password === ADMIN_PASSWORD){
            let ref = Firebase.database().ref(`/${currentWeekId}`)

            ref.on('value', snapshot => {
                var weekRef = snapshot.val();
                if (weekRef == null){
                    weekRef = {}
                }
                this.setState({
                    currentWeekReservations: weekRef,
                    errorMessage: "",
                    isLoggedIn: true
                })
            })
            return
        }
        this.setState({
            errorMessage: "Datos invalidos"
        })
    }

    render(){
        const {
            reservationDate,
            currentWeek,
            user,
            isLoggedIn,
            password,
            errorMessage,
            datesOptions,
            currentWeekReservations
        } = this.state
        const {handleDateChange, handleUserChange, handlePassChange, handleClickValidate, currentWeekId} = this
        // Find reservation Day ID
        var reservations = {}
        for (var dayId in currentWeek[currentWeekId]){
            if (currentWeek[currentWeekId][dayId].label === reservationDate){
                reservations = currentWeekReservations[dayId] ? currentWeekReservations[dayId] : {}
                break
            }
        }
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
                                    datesOptions={datesOptions}
                                    onDateSelected={event => handleDateChange(event.target.value)}
                                    disabled={!isLoggedIn}
                                />
                            </div> 
                            <ReservationsDisplay reservations={reservations} reservationDate={reservationDate}/>
                        </div>: <div class="date-selection-block"> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }
}

export default Admin
