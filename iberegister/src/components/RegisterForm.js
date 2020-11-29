import React, { Component } from 'react'
import Firebase from 'firebase'
import {MAX_ALLOWED_GUESTS, MAX_GUESTS_PER_RESERVATION} from "../config"
import CustomDatePicker from './CustomDatePicker'
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


class RegisterForm extends Component {

    constructor(props) {
        super(props)

        const nextSundayDate = nextAvailableDate()

        this.state = {
            reservationDate: nextSundayDate,
            availableSpace: 0,
            guests: ["","",""],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: Math.random().toString(36).substr(2, 9),
            reservationState: isAvailableReservation(nextSundayDate) ? PENDING_STATE: UNAVAILABLE_STATE,
            errorMessages: {
                personalDataName: false,
                personalDataPhone: false,
                guests: [false, false, false],
                notAvailableSpace: false
            }
        }
        this.addGuestInput = this.addGuestInput.bind(this)
        this.createReservation = this.createReservation.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
        this.handlePersonalDataChange = this.handlePersonalDataChange.bind(this)
        this.getReservationErrors = this.getReservationErrors.bind(this)
        this.checkAvailableSpace = this.checkAvailableSpace.bind(this)
    }

    getReservationErrors(){
        const {errorMessages, personalData} = this.state
        if (errorMessages.notAvailableSpace){
            return NO_ROOM_ERROR
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
            reservationDate,
            reservationId,
            availableSpace,
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

        var filtered = guests.filter(el => {return el.length > 0})
        filtered.push(personalData.name)
        if (filtered.length > availableSpace){
            errorMessages.notAvailableSpace = true
            this.setState({
                errorMessages: errorMessages,
                reservationState: FAILED_STATE
            })
            return
        }
        const guestStr = filtered.toString()
        const documentToSave = {
            guests: guestStr,
            name: personalData.name,
            phone: personalData.phone
        }
        const dbUrl = `/${reservationDate}/${reservationId}`
        Firebase.database().ref(dbUrl).set(documentToSave)
        this.setState({
            reservationState: COMPLETED_STATE
        })
    }

    addGuestInput(){
        let {guests, errorMessages} = this.state
        if (guests.length >= MAX_GUESTS_PER_RESERVATION){
            return
        }
        guests.push("")
        errorMessages.guests.push(false)
        this.setState({
            errorMessages: errorMessages,
            guests: guests
        })
    }

    handleInputChange(index, value){
        const {guests, errorMessages} = this.state
        errorMessages.guests[index] = value ? !isValidName(value) : false
        guests[index] = value
        errorMessages.notAvailableSpace = false
        this.setState({
            guests: guests,
            errorMessages: errorMessages
        })
    }

    handleDateChange(event){
        const {checkAvailableSpace} = this
        checkAvailableSpace(event.target.value)
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

    checkAvailableSpace(selectedDate){
        const {reservationState} = this.state
        if (reservationState === UNAVAILABLE_STATE){
            return
        }
        const dbUrl = `/${selectedDate}`
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var reservations = snapshot.val();
            if (reservations == null) {
                reservations = {}
            }
            var currentGuests = 0
            for (var reservation in reservations){
                const guestsFound = reservations[reservation].guests.split(",")
                currentGuests = currentGuests + guestsFound.length
            }
            this.setState({
                reservationDate: selectedDate,
                availableSpace: MAX_ALLOWED_GUESTS - currentGuests
            })
        })
    }

    componentDidMount(){
        const {reservationDate} = this.state
        const {checkAvailableSpace} = this
        checkAvailableSpace(reservationDate)
    }

    render() {
        const {
            reservationDate,
            reservationState,
            guests,
            personalData,
            errorMessages,
            availableSpace,
            reservationId
        } = this.state
        const {
            addGuestInput,
            createReservation,
            handleInputChange,
            handleDateChange,
            handlePersonalDataChange,
            getReservationErrors
        } = this
        return (
            <div className="registerForm">
                <div className="date-selection-block">
                    <CustomDatePicker
                        selectedDate={reservationDate}
                        onDateSelected={handleDateChange}
                        disabled={reservationState === UNAVAILABLE_STATE}
                    />
                    {
                        reservationState === UNAVAILABLE_STATE ? 
                        <div className="custom-subtitle">{UNAVAILABLE_DATE_MSG}</div> :
                        <div className="custom-subtitle">Quedan {availableSpace} espacios</div>
                    }
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={reservationState === COMPLETED_STATE || availableSpace <= 0}
                    handlePersonalDataChange={handlePersonalDataChange}
                    handleGuestInputChange={handleInputChange}
                    onClickAddGuest={addGuestInput}
                />
                <div>
                    <input 
                        type="button" 
                        className="button-add-reserve"
                        value={RESERVATION_BUTTON}
                        disabled={reservationState === COMPLETED_STATE || availableSpace <= 0}
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

export default RegisterForm