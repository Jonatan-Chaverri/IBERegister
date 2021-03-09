import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import {MAX_ALLOWED_GUESTS, MAX_GUESTS_PER_RESERVATION} from "../config"
import ConferenciaDatePicker from './ConferenciaDatePicker'
import GuestsInputForm from './GuestsInputForm'
import {nextAvailableDate, isValidName, isValidPhone, isAvailableReservation} from '../utils'

import {
    NO_ROOM_ERROR,
    INVALID_NAME_ERROR,
    INVALID_PHONE_ERROR,
    FAILED_STATE,
    COMPLETED_STATE,
    PENDING_STATE,
    UNAVAILABLE_STATE,
    RESERVATION_BUTTON,
    RESERVATION_SUCCESS,
    RESERVATION_FAILED,
    RESERVATION_WARNING,
    UNAVAILABLE_DATE_MSG
} from "../constants"

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

import "react-datepicker/dist/react-datepicker.css";


class ConferenciaRegisterForm extends Component {

    constructor(props) {
        super(props)

        const nextSundayDate = nextAvailableDate()

        this.state = {
            reservationDates: [],
            availableDates: {
                'Jueves(18-3)': 0,
                'Viernes(19-3)': 0,
                'Sabado(20-3)': 0,
                'Domingo(21-3)': 0
            },
            guests: [
                {name: "", kid: false},
                {name: "", kid: false},
                {name: "", kid: false}
            ],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: Math.random().toString(36).substr(2, 9),
            reservationState: PENDING_STATE,
            errorMessages: {
                noDateSelected: false,
                personalDataName: false,
                personalDataPhone: false,
                guests: [false, false, false],
                notAvailableSpace: [false, false, false, false]
            }
        }
        this.addGuestInput = this.addGuestInput.bind(this)
        this.createReservation = this.createReservation.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
        this.handlePersonalDataChange = this.handlePersonalDataChange.bind(this)
        this.getReservationErrors = this.getReservationErrors.bind(this)
        this.handleKidChange = this.handleKidChange.bind(this)
    }

    getReservationErrors(){
        const {errorMessages, personalData} = this.state
        const confDays = ["jueves", "viernes", "sabado", "domingo"]
        for (var i in errorMessages.notAvailableSpace){
            if (errorMessages.notAvailableSpace[i]){
                return `No hay espacio disponible para el ${confDays[i]}`
            }
        }
        if (errorMessages.noDateSelected){
            return "No seleccionó ninguna fecha"
        }
        if (errorMessages.personalDataName || !personalData.name){
            return INVALID_NAME_ERROR
        }
        if (errorMessages.personalDataPhone || !personalData.phone){
            return INVALID_PHONE_ERROR
        }
        const guestsValues = Object.values(errorMessages.guests)
        const guestError = guestsValues.indexOf(true)
        if (guestError !== -1){
            return `El nombre del invitado ${guestError + 1} no es válido`
        }
        return false
    }

    createReservation(){
        const {
            guests,
            personalData,
            reservationDates,
            reservationId,
            availableDates,
            errorMessages
        } = this.state

        const {getReservationErrors} = this
        const reservationErrors = getReservationErrors()
        if (reservationErrors){
            this.setState({
                reservationState: FAILED_STATE
            })
            return
        }

        if (reservationDates.length == 0){
            errorMessages.noDateSelected = true
            this.setState({
                errorMessages: errorMessages,
                reservationState: FAILED_STATE
            })
            return
        }

        const filtered = guests.filter(el => {return el.name.length > 0})
        const filteredNames = filtered.map(el =>{
            if (el.kid){
                return `${el.name.trim()} (niño)`
            }
            return el.name.trim()
        })
        filteredNames.push(personalData.name.trim())
        for (var i in reservationDates){
            if (availableDates[reservationDates[i]] < filteredNames.length){
                const confDaysOredered = [
                    'Jueves(18-3)',
                    'Viernes(19-3)',
                    'Sabado(20-3)',
                    'Domingo(21-3)'
                ]
                errorMessages.notAvailableSpace[
                    confDaysOredered.indexOf(reservationDates[i])
                ] = true
                this.setState({
                    errorMessages: errorMessages,
                    reservationState: FAILED_STATE
                })
                return
            }
        }
        const guestStr = filteredNames.toString()
        const documentToSave = {
            guests: guestStr,
            name: personalData.name.trim(),
            phone: personalData.phone
        }
        for (var dateIndex in reservationDates){
            const dbUrl = `/conferencia/${reservationDates[dateIndex]}/${reservationId}`
            Firebase.database().ref(dbUrl).set(documentToSave)
        }
        this.setState({
            reservationState: COMPLETED_STATE
        })
    }

    addGuestInput(){
        let {guests, errorMessages} = this.state
        if (guests.length >= MAX_GUESTS_PER_RESERVATION){
            return
        }
        guests.push({name: "", kid: false})
        errorMessages.guests.push(false)
        this.setState({
            errorMessages: errorMessages,
            guests: guests
        })
    }

    handleInputChange(index, value){
        const {guests, errorMessages} = this.state
        errorMessages.guests[index] = value ? !isValidName(value) : false
        guests[index].name = value
        errorMessages.notAvailableSpace = [false, false, false, false]
        this.setState({
            guests: guests,
            errorMessages: errorMessages
        })
    }

    handleDateChange(event){
        const {reservationDates, errorMessages} = this.state
        const dateSelected = event.target.value
        errorMessages.noDateSelected = false
        errorMessages.notAvailableSpace = [false, false, false, false]
        if (reservationDates.includes(dateSelected)){
            // Unselect
            const index = reservationDates.indexOf(dateSelected)
            reservationDates.splice(index, 1)
        } else{
            // Select
            reservationDates.push(dateSelected)
        }
        this.setState({
            errorMessages: errorMessages,
            reservationDates: reservationDates
        })
    }

    handlePersonalDataChange(nameValue, phoneValue){
        const{errorMessages} = this.state
        const formattedPhone = phoneValue.replace("-", "").replace(" ", "")

        errorMessages.personalDataName = nameValue ? !isValidName(nameValue) : false
        errorMessages.personalDataPhone = formattedPhone ? !isValidPhone(formattedPhone) : false
        this.setState({
            errorMessages: errorMessages,
            personalData: {
                name: nameValue,
                phone: formattedPhone
            }
        })
    }

    handleKidChange(guestIndex){
        const {guests} = this.state
        guests[guestIndex] = {
            name: guests[guestIndex].name,
            kid: !guests[guestIndex].kid
        }
        this.setState({
            guests: guests
        })
    }


    componentDidMount(){
        const dbUrl = '/conferencia'
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var confDays = snapshot.val();
            if (confDays == null) {
                confDays = {}
            }
            var availableDates = {
                'Jueves(18-3)': MAX_ALLOWED_GUESTS,
                'Viernes(19-3)': MAX_ALLOWED_GUESTS,
                'Sabado(20-3)': MAX_ALLOWED_GUESTS,
                'Domingo(21-3)': MAX_ALLOWED_GUESTS
            }
            for (var confDay in confDays){
                var currentGuests = 0
                for (var reservation in confDays[confDay]){
                    const guestsFound = confDays[confDay][reservation].guests.split(",")
                    currentGuests = currentGuests + guestsFound.length
                }
                availableDates[confDay] = availableDates[confDay] - currentGuests
            }
            this.setState({
                availableDates: availableDates
            })
        })
    }

    render() {
        const {
            reservationDates,
            reservationState,
            guests,
            personalData,
            errorMessages,
            availableDates,
            reservationId
        } = this.state
        const {
            addGuestInput,
            createReservation,
            handleInputChange,
            handleDateChange,
            handlePersonalDataChange,
            getReservationErrors,
            handleKidChange
        } = this
        return (
            <div className="registerForm">
                <div className="custom-header-title">Conferencia Aniversario IBE</div>
                <div className="date-selection-block">
                    <ConferenciaDatePicker
                        selectedDates={reservationDates}
                        availableDates={availableDates}
                        onDateSelected={handleDateChange}
                        disabled={reservationState === UNAVAILABLE_STATE}
                    />
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={reservationState === COMPLETED_STATE}
                    handlePersonalDataChange={handlePersonalDataChange}
                    handleGuestInputChange={handleInputChange}
                    onClickAddGuest={addGuestInput}
                    handleKidChange={handleKidChange}
                />
                <div>
                    <input
                        type="button"
                        className="button-add-reserve"
                        value={RESERVATION_BUTTON}
                        disabled={reservationState === COMPLETED_STATE}
                        onClick={createReservation}></input>
                </div>
                <div className="reservation-result-block-container">
                {
                    ![PENDING_STATE, UNAVAILABLE_STATE].includes(reservationState) ?
                            <div className="reservation-result-block">
                                <div className="reservation-status-block">
                                    {reservationState === COMPLETED_STATE?
                                      <p>{RESERVATION_SUCCESS}  <FaCheckCircle className="icon-check-circle"/></p>:
                                      <p>{RESERVATION_FAILED} <FaTimesCircle className="icon-fail-circle"/></p> }
                                </div>
                                {
                                    reservationState === COMPLETED_STATE ?
                                        <div className="reservation-number-block">
                                            <div className="reservation-number-block-warning">
                                                {RESERVATION_WARNING}
                                            </div>
                                            <div>
                                                Código de reservación: {reservationId}
                                            </div>
                                        </div> :
                                        <div className="reservation-number-block-error">
                                            {getReservationErrors()}
                                        </div>
                                }
                            </div>
                    : <div className="reservation-result-hidden">&nbsp;</div>
                }
                </div>
            </div>
        )
    }
}

export default ConferenciaRegisterForm
