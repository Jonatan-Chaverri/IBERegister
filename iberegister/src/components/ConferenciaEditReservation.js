import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import {CONF_MAX_ALLOWED_GUESTS} from "../config"
import CustomDatePicker from './CustomDatePicker'
import GuestsInputForm from './GuestsInputForm'
import ConferenciaDatePicker from './ConferenciaDatePicker'
import {nextAvailableDate, isValidName, isValidPhone, isAvailableReservation} from '../utils'

import {
    NO_ROOM_ERROR,
    INVALID_NAME_ERROR,
    INVALID_PHONE_ERROR,
    FAILED_STATE,
    COMPLETED_STATE,
    PENDING_STATE,
    FOUND_STATE,
    DELETED_STATE,
    UNAVAILABLE_STATE,
    INVALID_RESERVATION_CODE,
    RESERVATION_NOT_FOUND_ERROR,
    UPDATE_BUTTON,
    DELETE_RESERVATION_BUTTON,
    UPDATE_SUCCESS,
    DELETE_SUCCESS,
    SEARCH_BUTTON,
    UNAVAILABLE_DATE_MSG
} from "../constants"

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

import "react-datepicker/dist/react-datepicker.css";


class EditReservationForm extends Component {

    constructor(props) {
        super(props)

        const nextSundayDate = nextAvailableDate()

        this.state = {
            guests: [
                {name: "", kid: false},
                {name: "", kid: false},
                {name: "", kid: false}
            ],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: "",
            updateState: PENDING_STATE,
            reservationDates: [],
            availableDates: {
                'Jueves(18-3)': 0,
                'Viernes(19-3)': 0,
                'Sabado(20-3)': 0,
                'Domingo(21-3)': 0
            },
            errorMessages: {
                personalDataName: false,
                noDateSelected: false,
                personalDataPhone: false,
                guests: [false, false, false],
                notAvailableSpace: [false, false, false, false],
                reservationNotFound: false,
                reservationNotValid: false
            }
        }
        this.handleDateChange = this.handleDateChange.bind(this)
        this.handleReservationChange = this.handleReservationChange.bind(this)
        this.handleClickSearch = this.handleClickSearch.bind(this)
        this.handlePersonalDataChange = this.handlePersonalDataChange.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.addGuestInput = this.addGuestInput.bind(this)
        this.handleClickUpdate = this.handleClickUpdate.bind(this)
        this.getReservationErrors = this.getReservationErrors.bind(this)
        this.handleClickDelete = this.handleClickDelete.bind(this)
        this.handleKidChange = this.handleKidChange.bind(this)
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

    handleReservationChange(event){
        const value = event.target.value.replace(" ", "")
        if (value.length > 9){
            return
        }
        this.setState({
            reservationId: value
        })
    }

    handleClickSearch(event){
        const {reservationId, availableDates, errorMessages} = this.state
        if (reservationId.length < 9){
            // Reservation code should have 9 digits exactly
            errorMessages.reservationNotValid = true
            errorMessages.reservationNotFound = false
            this.setState({
                errorMessages: errorMessages
            })
            return
        }
        errorMessages.reservationNotValid = false
        var reservation = null
        var reservationDates = []
        for (var confDay in availableDates){
            if (reservationId in availableDates[confDay]){
                reservation = availableDates[confDay][reservationId]
                reservationDates.push(confDay)
            }
        }

        if (reservation == null){
            errorMessages.reservationNotFound = true
            this.setState({
                errorMessages: errorMessages
            })
            return
        }
        errorMessages.reservationNotFound = false
        const guestsFound = reservation.guests.replace(reservation.name, "").split(",")
        // Parse guest in string format to object
        const guests = guestsFound.map(guestName => {
            let guestObject = {
                name: guestName.indexOf('(') == -1 ? guestName :
                    guestName.substring(0, guestName.indexOf('(')).trim(),
                kid: guestName.includes('(')
            }
            return guestObject
        })
        errorMessages.guests = Array(guestsFound.length).fill(false)
        this.setState({
            guests: guests,
            personalData: {
                name: reservation.name,
                phone: reservation.phone
            },
            reservationDates: reservationDates,
            updateState: FOUND_STATE,
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

    addGuestInput(){
        let {guests, errorMessages} = this.state
        if (guests.length >= 10){
            return
        }
        guests.push({name: "", kid: false})
        errorMessages.guests.push(false)
        this.setState({
            errorMessages: errorMessages,
            guests: guests
        })
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
            return `El nombre del invitado ${guestError + 1} no es valido`
        }
        return false
    }

    handleClickUpdate(){
        const {
            guests,
            personalData,
            reservationDates,
            availableDates,
            reservationId,
            errorMessages
        } = this.state
        const {getReservationErrors} = this

        if (getReservationErrors()){
            this.setState({
                updateState: FAILED_STATE
            })
            return
        }

        // Check if we have space for all selected days
        var filtered = guests.filter(el => {return el.name.length > 0})
        const filteredNames = filtered.map(el =>{
            if (el.kid){
                return `${el.name.trim()} (niño)`
            }
            return el.name.trim()
        })
        filteredNames.push(personalData.name.trim())
        for (var confDay in reservationDates){
            var currentGuests = 0
            const reservations = availableDates[reservationDates[confDay]]
            for (var reservation in reservations){
                if (reservation === reservationId){
                    continue
                }
                const guestsFound = reservations[reservation].guests.split(",")
                currentGuests = currentGuests + guestsFound.length
            }
            const availableSpace = CONF_MAX_ALLOWED_GUESTS - currentGuests
            if (filteredNames.length > availableSpace){
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
                    updateState: FAILED_STATE,
                    errorMessages: errorMessages
                })
                return
            }
        }

        // Delete all previous reservations
        for (var i in availableDates){
            for (var reservation in availableDates[i]){
                if (reservation == reservationId){
                    Firebase.database().ref(
                        `/conferencia/${i}/${reservationId}`
                    ).remove()
                }
            }
        }

        const documentToSave = {
            guests: filteredNames.toString(),
            name: personalData.name.trim(),
            phone: personalData.phone
        }
        for (var i in reservationDates){
            const dbUrl = `/conferencia/${reservationDates[i]}/${reservationId}`
            Firebase.database().ref(dbUrl).set(documentToSave)
        }
        this.setState({
            updateState: COMPLETED_STATE
        })
    }

    handleClickDelete(){
        const {availableDates, reservationId} = this.state
        for (var i in availableDates){
            for (var reservation in availableDates[i]){
                if (reservation == reservationId){
                    Firebase.database().ref(
                        `/conferencia/${i}/${reservationId}`
                    ).remove()
                }
            }
        }
        this.setState({
            updateState: DELETED_STATE
        })
    }

    componentDidMount(){
        const dbUrl = '/conferencia'
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var availableDates = snapshot.val();
            const confDays = ['Jueves(18-3)', 'Viernes(19-3)', 'Sabado(20-3)', 'Domingo(21-3)']
            if (availableDates == null) {
                availableDates = {}
            }
            for (var i in confDays){
                availableDates[confDays[i]] = availableDates[confDays[i]] ? availableDates[confDays[i]] : {}
            }
            this.setState({
                availableDates: availableDates
            })
        })
    }


    render(){
        const {
            reservationDates,
            availableDates,
            reservationId,
            personalData,
            guests,
            errorMessages,
            updateState
        } = this.state
        const {
            handleDateChange,
            handleReservationChange,
            handleClickSearch,
            handlePersonalDataChange,
            handleInputChange,
            addGuestInput,
            handleClickUpdate,
            getReservationErrors,
            handleClickDelete,
            handleKidChange
        } = this
        return(
            <div className="registerForm">
                <div className="guests-block">
                    <div className="horizontal-block">
                        <div className="custom-header-text">Código de reservación</div>
                        <input className="text-input" type="text" value={reservationId} onChange={handleReservationChange}/>
                    </div>
                </div>
                <div className="main-block">
                    <input
                        className="button-add-reserve"
                        type="button"
                        value={SEARCH_BUTTON}
                        onClick={handleClickSearch}
                        disabled={
                            [FOUND_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE].includes(updateState)
                        }
                    />
                </div>
                <div className="error-message">
                {
                    errorMessages.reservationNotFound ?
                        <div>{RESERVATION_NOT_FOUND_ERROR} <FaTimesCircle className="icon-fail-circle"/></div>
                         : errorMessages.reservationNotValid ?
                            <div>{INVALID_RESERVATION_CODE} <FaTimesCircle className="icon-fail-circle"/></div> :
                            <div>&nbsp;</div>
                }
                </div>
                <div className="date-selection-block">
                    <ConferenciaDatePicker
                        selectedDates={reservationDates}
                        onDateSelected={handleDateChange}
                        disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE].includes(updateState)}
                    />
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE].includes(updateState)}
                    handlePersonalDataChange={handlePersonalDataChange}
                    handleGuestInputChange={handleInputChange}
                    onClickAddGuest={addGuestInput}
                    handleKidChange={handleKidChange}
                />
                <div className="main-block">
                    <div className="main-block horizontal-block">
                        <input
                            className="button-add-reserve"
                            type="button"
                            value={UPDATE_BUTTON}
                            disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE].includes(updateState)}
                            onClick={handleClickUpdate}/>
                    </div>
                    <div className="main-block horizontal-block">
                        <input
                        className="button-warning"
                        type="button"
                        value={DELETE_RESERVATION_BUTTON}
                        disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE].includes(updateState)}
                        onClick={handleClickDelete}
                    />
                    </div>
                </div>
                <div>
                    {
                        updateState === FAILED_STATE ? <div className="error-message">{getReservationErrors()}</div> :
                        updateState === COMPLETED_STATE? <div className="text-success">{UPDATE_SUCCESS} <FaCheckCircle className="icon-check-circle"/></div> :
                        updateState === DELETED_STATE ?  <div className="text-error">{DELETE_SUCCESS} <FaCheckCircle className="icon-check-circle"/></div> :
                        updateState === UNAVAILABLE_STATE ?  <div className="text-error">{UNAVAILABLE_DATE_MSG}</div> :
                        <div> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }

}

export default EditReservationForm
