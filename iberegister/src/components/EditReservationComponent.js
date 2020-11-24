import React, { Component } from 'react'
import Firebase from 'firebase'
import {MAX_ALLOWED_GUESTS} from "../config"
import CustomDatePicker from './CustomDatePicker'
import GuestsInputForm from './GuestsInputForm'
import {nextAvailableDate} from '../utils'

import {
    NO_ROOM_ERROR,
    INVALID_NAME_ERROR,
    INVALID_PHONE_ERROR,
    FAILED_STATE,
    COMPLETED_STATE,
    PENDING_STATE,
    FOUND_STATE,
    DELETED_STATE,
    INVALID_RESERVATION_CODE,
    RESERVATION_NOT_FOUND_ERROR,
    UPDATE_BUTTON,
    DELETE_RESERVATION_BUTTON,
    UPDATE_SUCCESS,
    DELETE_SUCCESS,
    SEARCH_BUTTON
} from "../constants"

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

import "react-datepicker/dist/react-datepicker.css";


class EditReservationForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            guests: ["","",""],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: "",
            updateState: PENDING_STATE,
            reservationDate: nextAvailableDate(new Date()),
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
        this.isValidName = this.isValidName.bind(this)
        this.isValidPhone = this.isValidPhone.bind(this)
        this.handleClickUpdate = this.handleClickUpdate.bind(this)
        this.getReservationErrors = this.getReservationErrors.bind(this)
        this.handleClickDelete = this.handleClickDelete.bind(this)
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
            errorMessages.guests = Array(guestsFound.length).fill(false)
            this.setState({
                guests: guestsFound,
                personalData: {
                    name: reservation.name,
                    phone: reservation.phone
                },
                updateState: FOUND_STATE,
                errorMessages: errorMessages
            })
        })
    }

    isValidName(name){
        const regex = /^[A-Za-zñÑ]{1,15}\s[A-Za-zñÑ]{1,15}(\s[A-Za-zñÑ]{1,15}$|$)/
        return regex.test(name)
    }

    isValidPhone(phone){
        const regex = /^[0-9]{8}$/
        return regex.test(phone)
    }

    handlePersonalDataChange(nameValue, phoneValue){
        const{errorMessages} = this.state
        const{isValidName, isValidPhone} = this
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
        const{isValidName} = this
        errorMessages.guests[index] = value ? !isValidName(value) : false
        guests[index] = value
        errorMessages.notAvailableSpace = false
        this.setState({
            guests: guests,
            errorMessages: errorMessages
        })
    }

    addGuestInput(){
        let {guests, errorMessages} = this.state
        if (guests.length >= 10){
            return
        }
        guests.push("")
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
        if (guestError != -1){
            return `El nombre del invitado ${guestError + 1} no es valido`
        }
        return false
    }

    handleClickUpdate(){
        const {guests, personalData, reservationDate, reservationId, updateState, errorMessages} = this.state
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
                if (reservation == reservationId){
                    continue
                }
                const guestsFound = reservations[reservation].guests.split(",")
                currentGuests = currentGuests + guestsFound.length
            }
            const availableSpace = MAX_ALLOWED_GUESTS - currentGuests
            var filtered = guests.filter(el => {return el.length > 0})
            filtered.push(personalData.name)
            if (filtered.length > availableSpace){
                errorMessages.notAvailableSpace = true
                this.setState({
                    updateState: FAILED_STATE,
                    errorMessages: errorMessages
                })
                return
            }
            const documentToSave = {
                guests: filtered.toString(),
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
            handleClickDelete
        } = this
        return(
            <div class="registerForm">
                <div class="guests-block">
                    <div class="horizontal-block horizontal-space-block">
                        <CustomDatePicker selectedDate={reservationDate} onDateSelected={handleDateChange}/>
                    </div>
                    <div class="horizontal-block horizontal-space-block">
                        <div class="custom-header-text">Código de reservación</div>
                        <input className="text-input" type="text" value={reservationId} onChange={handleReservationChange}/>
                    </div>
                </div>
                <div class="main-block">
                    <input 
                        class="button-add-reserve"
                        type="button"
                        value={SEARCH_BUTTON}
                        onClick={handleClickSearch}
                        disabled={[FOUND_STATE,COMPLETED_STATE, DELETED_STATE].includes(updateState)}
                    />
                </div>
                <div class="error-message">
                {
                    errorMessages.reservationNotFound ?
                        <div>{RESERVATION_NOT_FOUND_ERROR} <FaTimesCircle class="icon-fail-circle"/></div>
                         : errorMessages.reservationNotValid ?
                            <div>{INVALID_RESERVATION_CODE} <FaTimesCircle class="icon-fail-circle"/></div> :
                            <div>&nbsp;</div>
                }
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE].includes(updateState)}
                    handlePersonalDataChange={handlePersonalDataChange}
                    handleGuestInputChange={handleInputChange}
                    onClickAddGuest={addGuestInput}
                />
                <div class="main-block">
                    <div class="main-block horizontal-block">
                        <input 
                            class="button-add-reserve"
                            type="button"
                            value={UPDATE_BUTTON}
                            disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE].includes(updateState)}
                            onClick={handleClickUpdate}/>
                    </div>
                    <div class="main-block horizontal-block">
                        <input
                        class="button-warning"
                        type="button"
                        value={DELETE_RESERVATION_BUTTON}
                        disabled={[PENDING_STATE, COMPLETED_STATE, DELETED_STATE].includes(updateState)}
                        onClick={handleClickDelete}
                    />
                    </div>
                </div>
                <div>
                    {
                        updateState == FAILED_STATE ? <div class="error-message">{getReservationErrors()}</div> :
                        updateState == COMPLETED_STATE? <div class="text-success">{UPDATE_SUCCESS} <FaCheckCircle class="icon-check-circle"/></div> :
                        updateState == DELETED_STATE ?  <div class="text-error">{DELETE_SUCCESS} <FaCheckCircle class="icon-check-circle"/></div> :
                        <div> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }

}

export default EditReservationForm