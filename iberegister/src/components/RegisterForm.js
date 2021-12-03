import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import {MAX_ALLOWED_GUESTS, MAX_GUESTS_PER_RESERVATION} from "../config"
import CustomDatePicker from './CustomDatePicker'
import GuestsInputForm from './GuestsInputForm'
import CustomDayPicker from './CustomDayPicker'
import {nextAvailableDate, isValidName, isValidPhone, isAvailableReservation, getCurrentWeek} from '../utils'

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

        const currentWeekInfo = getCurrentWeek()
        this.currentWeekId = Object.keys(currentWeekInfo)[0]

        this.state = {
            reservationDate: "",
            currentWeek: currentWeekInfo,
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
        this.handleKidChange = this.handleKidChange.bind(this)
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
            errorMessages,
            currentWeek
        } = this.state

        const {getReservationErrors, currentWeekId} = this
        const reservationErrors = getReservationErrors()
        if (reservationErrors){
            this.setState({
                reservationState: FAILED_STATE
            })
            return
        }

        if (reservationDate.length === 0){
            this.setState({
                reservationState: FAILED_STATE
            })
            return
        }

        // Check out space
        const availableSpace = currentWeek[currentWeekId][reservationDate].space

        const filtered = guests.filter(el => {return el.name.length > 0})
        const filteredNames = filtered.map(el =>{
            if (el.kid){
                return `${el.name.trim()} (niño)`
            }
            return el.name.trim()
        })

        filteredNames.push(personalData.name.trim())
        const guestStr = filteredNames.toString()
        const kidsCount = (guestStr.match(/(niño)/g) || []).length
        if ((filteredNames.length - kidsCount) > availableSpace){
            errorMessages.notAvailableSpace = true
            this.setState({
                errorMessages: errorMessages,
                reservationState: FAILED_STATE
            })
            return
        }

        // Save document
        const documentToSave = {
            guests: guestStr,
            name: personalData.name.trim(),
            phone: personalData.phone
        }
        const dbUrl = `/${currentWeekId}/${reservationDate}/${reservationId}`
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
        errorMessages.notAvailableSpace = false
        this.setState({
            guests: guests,
            errorMessages: errorMessages
        })
    }

    handleDateChange(selectedDate){
        const {errorMessages} = this.state
        errorMessages.notAvailableSpace = false
        this.setState({
            reservationDate: selectedDate,
            errorMessages: errorMessages
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
        const {currentWeekId} = this
        let ref = Firebase.database().ref(`/${currentWeekId}`)
        ref.on('value', snapshot => {
            const {currentWeek} = this.state
            var weekRef = snapshot.val();
            if (weekRef == null){
                weekRef = {}
            }
            for (var dayRef in currentWeek[currentWeekId]){
                var currentGuests = 0
                const reservations = weekRef[dayRef] ? weekRef[dayRef] : {}
                for (var reservation in reservations){
                    const kidsCount = (
                        reservations[reservation].guests.match(/(niño)/g) || []
                    ).length
                    const guestsFound = reservations[reservation].guests.split(",")
                    currentGuests = currentGuests + guestsFound.length - kidsCount
                }
                const availableSpace = MAX_ALLOWED_GUESTS - currentGuests > 0 ?
                    MAX_ALLOWED_GUESTS - currentGuests : 0
                currentWeek[currentWeekId][dayRef].space = availableSpace
            }
            this.setState({
                currentWeek: currentWeek
            })
        })
    }

    render() {
        const {
            reservationDate,
            reservationState,
            guests,
            personalData,
            errorMessages,
            reservationId,
            currentWeek
        } = this.state
        const {
            addGuestInput,
            createReservation,
            handleInputChange,
            handleDateChange,
            handlePersonalDataChange,
            getReservationErrors,
            handleKidChange,
            currentWeekId
        } = this
        const availableSpace = reservationDate ? currentWeek[currentWeekId][reservationDate].space : 0
        return (
            <div className="registerForm">
                <div className="date-selection-block">
                    <CustomDayPicker
                        currentWeek={currentWeek}
                        selectedDay={reservationDate}
                        onDateSelected={handleDateChange}
                        disabled={reservationState === COMPLETED_STATE}
                    />
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={reservationState === COMPLETED_STATE || availableSpace <= 0}
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
