import React, { Component } from 'react'
import Firebase from "firebase/app"
import 'firebase/database'
import {MAX_ALLOWED_GUESTS} from "../config"
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
            updateState: isAvailableReservation(nextSundayDate) ? PENDING_STATE : UNAVAILABLE_STATE,
            reservationDate: nextSundayDate,
            errorMessages: {
                personalDataName: false,
                personalDataPhone: false,
                guests: [false, false, false],
                notAvailableSpace: false,
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
        this.setState({
            reservationDate: event.target.value
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
        const {reservationId, reservationDate, errorMessages} = this.state
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
        const dbUrl = `/${reservationDate}/${reservationId}`
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var reservation = snapshot.val();
            ref.off('value')
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
                updateState: FOUND_STATE,
                errorMessages: errorMessages
            })
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
        errorMessages.notAvailableSpace = false
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
            return `El nombre del invitado ${guestError + 1} no es valido`
        }
        return false
    }

    handleClickUpdate(){
        const {guests, personalData, reservationDate, reservationId, errorMessages} = this.state
        const {getReservationErrors} = this

        if (getReservationErrors()){
            this.setState({
                updateState: FAILED_STATE
            })
            return
        }
        const dbUrl = `/${reservationDate}`
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var reservations = snapshot.val();
            ref.off('value')
            if (reservations == null) {
                reservations = {}
            }
            var currentGuests = 0
            for (var reservation in reservations){
                if (reservation === reservationId){
                    continue
                }
                const guestsFound = reservations[reservation].guests.split(",")
                currentGuests = currentGuests + guestsFound.length
            }
            const availableSpace = MAX_ALLOWED_GUESTS - currentGuests
            var filtered = guests.filter(el => {return el.name.length > 0})
            const filteredNames = filtered.map(el =>{
                if (el.kid){
                    return `${el.name} (niño)`
                }
                return el.name
            })
            filteredNames.push(personalData.name)
            if (filteredNames.length > availableSpace){
                errorMessages.notAvailableSpace = true
                this.setState({
                    updateState: FAILED_STATE,
                    errorMessages: errorMessages
                })
                return
            }
            const documentToSave = {
                guests: filteredNames.toString(),
                name: personalData.name,
                phone: personalData.phone
            }
            const dbUrl = `/${reservationDate}/${reservationId}`
            Firebase.database().ref(dbUrl).set(documentToSave)
            this.setState({
                updateState: COMPLETED_STATE
            })
        })
    }

    handleClickDelete(){
        const {reservationDate, reservationId} = this.state
        const dbUrl = `/${reservationDate}/${reservationId}`
        Firebase.database().ref(dbUrl).remove()
        this.setState({
            updateState: DELETED_STATE
        })
    }


    render(){
        const {
            reservationDate,
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
                    <div className="horizontal-block horizontal-space-block">
                        <CustomDatePicker
                            selectedDate={reservationDate}
                            onDateSelected={handleDateChange}
                            disabled={updateState === UNAVAILABLE_STATE}
                        />
                    </div>
                    <div className="horizontal-block horizontal-space-block">
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