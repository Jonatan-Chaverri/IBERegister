import React, { Component } from 'react'

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import FormatUnicorn from 'format-unicorn/safe'
import Firebase from "firebase/app"
import 'firebase/database'

import CustomDayPicker from './CustomDayPicker'
import GuestsInputForm from './GuestsInputForm'
import { isValidName, isValidPhone, getCurrentWeek } from '../utils'

import {
    FAILED_STATE,
    COMPLETED_STATE,
    PENDING_STATE,
    FOUND_STATE,
    DELETED_STATE,
    UNAVAILABLE_STATE,
} from "../constants"

import {
    NO_ROOM_ERROR,
    INVALID_NAME_ERROR,
    INVALID_PHONE_ERROR,
    INVALID_RESERVATION_CODE,
    INVALID_GUEST_NAME_ERROR,
    RESERVATION_NOT_FOUND_ERROR,
    UPDATE_BUTTON,
    DELETE_RESERVATION_BUTTON,
    UPDATE_SUCCESS,
    DELETE_SUCCESS,
    SEARCH_BUTTON,
    UNAVAILABLE_DATE_MSG
} from "../strings"


class EditReservationForm extends Component {

    constructor(props) {
        super(props)

        const currentWeekInfo = getCurrentWeek()
        this.currentWeekId = Object.keys(currentWeekInfo)[0]

        this.state = {
            currentWeek: currentWeekInfo,
            guests: [
                { name: "", kid: false },
                { name: "", kid: false },
                { name: "", kid: false }
            ],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: "",
            updateState: PENDING_STATE,
            reservationDate: "",
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

    /*
     * Callback function for when there is a change in the selected Date
     */
    handleDateChange(selectedDate){
        const { errorMessages } = this.state
        errorMessages.notAvailableSpace = false
        this.setState({
            reservationDate: selectedDate,
            errorMessages: errorMessages
        })
    }

    /*
     * Callback function for when there is a change in reservation code input
     */
    handleReservationChange(event){
        const value = event.target.value.replace(" ", "")
        // Reservation codes should have 9 characters exactly
        if (value.length > 9){
            return
        }
        this.setState({
            reservationId: value
        })
    }

    /*
     * Callback function for when user clicks the "buscar" button. Search for
     * the provided reservation code in the selected date reservations
     */
    handleClickSearch(event){
        const {
            reservationId,
            reservationDate,
            errorMessages,
            currentWeek
        } = this.state
        const { currentWeekId } = this

        if (reservationId.length < 9){
            // Reservation code should have 9 characters exactly
            errorMessages.reservationNotValid = true
            errorMessages.reservationNotFound = false
            this.setState({
                errorMessages: errorMessages
            })
            return
        }
        errorMessages.reservationNotValid = false

        const currentWeekInfoDb = currentWeek[currentWeekId][reservationDate]
        if (currentWeekInfoDb.reservations[reservationId]){
             // Reservation found
            const reservation = currentWeekInfoDb.reservations[reservationId]
            const guestsFound = reservation.guests.replace(
                reservation.name, "").split(",")

            const guests = guestsFound.map(guestName => {
                let guestObject = {
                    name: guestName.indexOf('(') === -1 ? guestName :
                        guestName.substring(0, guestName.indexOf('(')).trim(),
                    kid: guestName.includes('(')
                }
                return guestObject
            })
            errorMessages.reservationNotFound = false
            errorMessages.reservationNotValid = false
            this.setState({
                guests: guests,
                personalData: {
                    name: reservation.name,
                    phone: reservation.phone
                },
                updateState: FOUND_STATE,
                errorMessages: errorMessages,
                reservationDate: reservationDate
            })
            return
        }
        // Reservation not found
        errorMessages.reservationNotFound = true
        this.setState({
            errorMessages: errorMessages
        })
        return

    }

    /*
     * Callback function for when there is a change in reservations personal
     * data
     */
    handlePersonalDataChange(nameValue, phoneValue){
        const{ errorMessages } = this.state
        const formattedPhone = phoneValue.replace("-", "").replace(" ", "")

        errorMessages.personalDataName = nameValue ?
            !isValidName(nameValue) : false
        errorMessages.personalDataPhone = formattedPhone ?
            !isValidPhone(formattedPhone) : false

        this.setState({
            errorMessages: errorMessages,
            personalData: {
                name: nameValue,
                phone: formattedPhone
            }
        })
    }

    /*
     * Callback function for when there is a change in a guest name
     */
    handleInputChange(index, value){
        const { guests, errorMessages } = this.state
        errorMessages.guests[index] = value ? !isValidName(value) : false
        guests[index].name = value
        errorMessages.notAvailableSpace = false
        this.setState({
            guests: guests,
            errorMessages: errorMessages
        })
    }

    /*
     * Callback function for when a guest is selected (or deselected) as a kid
     */
    handleKidChange(guestIndex){
        const { guests } = this.state
        guests[guestIndex] = {
            name: guests[guestIndex].name,
            kid: !guests[guestIndex].kid
        }
        this.setState({
            guests: guests
        })
    }

    /*
     * Callback function for "add guest" button on UI.
     * Adds one guest text input field to the UI.
     */
    addGuestInput(){
        let { guests, errorMessages } = this.state
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

    /*
     * Translate error flags to error messages to show to the user
     */
    getReservationErrors(){
        const { errorMessages, personalData } = this.state
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
            return FormatUnicorn(
                INVALID_GUEST_NAME_ERROR,
                { guests: guestError + 1 }
            )
        }
        return false
    }

    /*
     * Callback function for "Actualizar" button. Process the update request
     * for reservation.
     */
    handleClickUpdate(){
        const { defaultCapacity } = this.props
        const {
            guests,
            personalData,
            reservationDate,
            reservationId,
            errorMessages,
            currentWeek
        } = this.state
        const { getReservationErrors, currentWeekId } = this

        if (getReservationErrors()){
            this.setState({
                updateState: FAILED_STATE
            })
            return
        }

        // Check available space
        var filtered = guests.filter(el => { return el.name.length > 0 })
        const filteredNames = filtered.map(el =>{
            if (el.kid){
                return `${el.name.trim()} (niño)`
            }
            return el.name.trim()
        })
        filteredNames.push(personalData.name.trim())
        const kidsReservation = (
            filteredNames.toString().match(/(niño)/g) || []
        ).length

        const availableSpace = defaultCapacity -
            currentWeek[currentWeekId][reservationDate].space
        if ((filteredNames.length - kidsReservation) > availableSpace){
            errorMessages.notAvailableSpace = true
            this.setState({
                updateState: FAILED_STATE,
                errorMessages: errorMessages
            })
            return
        }

        const documentToSave = {
            guests: filteredNames.toString(),
            name: personalData.name.trim(),
            phone: personalData.phone,
            timestamp: Date.now()
        }
        const dbUrl = `/${currentWeekId}/${reservationDate}/${reservationId}`
        Firebase.database().ref(dbUrl).set(documentToSave)
                .then(() => {
                    this.setState({
                        updateState: COMPLETED_STATE
                    })
                })
                .catch((error) => {
                    this.setState({
                        updateState: FAILED_STATE
                    })
                })
    }

    /*
     * Callback function for "eliminar reserva" button. Handles the delete
     * reservation request from the user.
     */
    handleClickDelete(){
        const { reservationDate, reservationId } = this.state
        const { currentWeekId } = this
        const dbUrl = `/${currentWeekId}/${reservationDate}/${reservationId}`
        Firebase.database().ref(dbUrl).remove()
                .then(() => {
                    this.setState({
                        updateState: DELETED_STATE
                    })
                })
                .catch((error) => {
                    this.setState({
                        reservationState: FAILED_STATE
                    })
                })
    }


    componentDidMount(){
        const { currentWeekId } = this

        Firebase.database().ref(`/${ currentWeekId }`).on('value', snapshot => {
            const { currentWeek } = this.state
            var weekRef = snapshot.val();
            if (weekRef == null){
                weekRef = {}
            }

            for (var dayRef in currentWeek[currentWeekId]){
                var currentGuests = 0
                const reservations = weekRef[dayRef] ? weekRef[dayRef] : {}
                currentWeek[currentWeekId][dayRef].reservations = reservations

                for (var reservation in reservations){
                    const kidsCount = (
                        reservations[reservation].guests.match(/(niño)/g) || []
                    ).length
                    const guestsFound = reservations[reservation].guests.split(",")
                    currentGuests = currentGuests + guestsFound.length - kidsCount
                }

                currentWeek[currentWeekId][dayRef].space = currentGuests
            }

            this.setState({
                currentWeek: currentWeek
            })
        })
    }


    render(){
        const { defaultCapacity } = this.props
        const {
            reservationDate,
            reservationId,
            personalData,
            guests,
            errorMessages,
            updateState,
            currentWeek
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
        const disabledStatesSearch = [
            FOUND_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE
        ]
        const disabledStatesUpdate = [
            PENDING_STATE, COMPLETED_STATE, DELETED_STATE, UNAVAILABLE_STATE
        ]
        return(
            <div className="edit-form">
                <div className="edit-form__search-block">
                    <div className="edit-form__date-selection-block">
                        <CustomDayPicker
                            currentWeek={ currentWeek }
                            selectedDay={ reservationDate }
                            onDateSelected={ handleDateChange }
                            defaultCapacity={ defaultCapacity }
                            disabled={
                                disabledStatesSearch.includes(updateState)
                            }
                        />
                    </div>
                    <div className="edit-form__res-code-input-block">
                        <div className="section-title">
                            Código de reservación
                        </div>
                        <input
                            className="text-input"
                            type="text"
                            value={ reservationId }
                            onChange={ handleReservationChange }
                        />
                    </div>
                </div>
                <input
                    className="button-add-reserve"
                    type="button"
                    value={ SEARCH_BUTTON }
                    onClick={ handleClickSearch }
                    disabled={
                        disabledStatesSearch.includes(updateState) ||
                        !reservationDate
                    }
                />
                <div className="edit-form__res-search-error-message-block">
                {
                    errorMessages.reservationNotFound ?
                        <div>
                            { RESERVATION_NOT_FOUND_ERROR }
                            <FaTimesCircle className="icon-fail-circle"/>
                        </div> : errorMessages.reservationNotValid ?
                        <div>
                            { INVALID_RESERVATION_CODE }
                            <FaTimesCircle className="icon-fail-circle"/>
                        </div> : <div>&nbsp;</div>
                }
                </div>

                <GuestsInputForm
                    personalData={ personalData }
                    guests={ guests }
                    errorMessages={ errorMessages }
                    disabled={ disabledStatesUpdate.includes(updateState) }
                    handlePersonalDataChange={ handlePersonalDataChange }
                    handleGuestInputChange={ handleInputChange }
                    onClickAddGuest={ addGuestInput }
                    handleKidChange={ handleKidChange }
                />

                <div className="edit-form__update-delete-buttons-block">
                    <div>
                        <input 
                            className="button-add-reserve"
                            type="button"
                            value={ UPDATE_BUTTON }
                            disabled={
                                disabledStatesUpdate.includes(updateState)
                            }
                            onClick={ handleClickUpdate }
                        />
                    </div>
                    <div>
                        <input
                            className="button-warning"
                            type="button"
                            value={ DELETE_RESERVATION_BUTTON }
                            disabled={
                                disabledStatesUpdate.includes(updateState)
                            }
                            onClick={ handleClickDelete }
                        />
                    </div>
                </div>
                <div>
                    {
                        updateState === FAILED_STATE ?
                        <div className="error-message">
                            { getReservationErrors() }
                        </div> :

                        updateState === COMPLETED_STATE ?
                        <div className="text-success">
                            { UPDATE_SUCCESS }
                            <FaCheckCircle className="icon-check-circle"/>
                        </div> :

                        updateState === DELETED_STATE ?
                        <div className="text-error">
                            { DELETE_SUCCESS }
                            <FaCheckCircle className="icon-check-circle"/>
                        </div> :

                        updateState === UNAVAILABLE_STATE ?
                        <div className="text-error">
                            { UNAVAILABLE_DATE_MSG }
                        </div> : <div> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }

}

export default EditReservationForm
