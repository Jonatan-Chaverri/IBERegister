import React, { Component } from 'react'

// Check more icons at https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import FormatUnicorn from 'format-unicorn/safe'
import "react-datepicker/dist/react-datepicker.css";
import Firebase from "firebase/app"
import 'firebase/database'

import GuestsInputForm from './GuestsInputForm'
import CustomDayPicker from './CustomDayPicker'

import { isValidName, isValidPhone, getCurrentWeek } from '../utils'
import { MAX_GUESTS_PER_RESERVATION } from "../config"

import {
    FAILED_STATE,
    COMPLETED_STATE,
    PENDING_STATE,
    UNAVAILABLE_STATE
} from "../constants"

import {
    NO_ROOM_ERROR,
    INVALID_NAME_ERROR,
    INVALID_PHONE_ERROR,
    INVALID_GUEST_NAME_ERROR,
    RESERVATION_BUTTON,
    RESERVATION_SUCCESS,
    RESERVATION_FAILED,
    RESERVATION_WARNING
} from "../strings"


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

    createReservation(){
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

        // Check if there is any existing error on the reservation
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


        // Parse the list of guests to string
        const filtered = guests.filter(el => { return el.name.length > 0 })
        const filteredNames = filtered.map(el =>{
            if (el.kid){
                return `${el.name.trim()} (niño)`
            }
            return el.name.trim()
        })
        filteredNames.push(personalData.name.trim())

        const guestStr = filteredNames.toString()
        const kidsCount = (guestStr.match(/(niño)/g) || []).length

        // Check available space
        const availableSpace = defaultCapacity -
            currentWeek[currentWeekId][reservationDate].space
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
            phone: personalData.phone,
            timestamp: Date.now()
        }
        const dbUrl = `/${currentWeekId}/${reservationDate}/${reservationId}`

        Firebase.database().ref(dbUrl).set(documentToSave)
            .then(() => {
                this.setState({
                    reservationState: COMPLETED_STATE
                })
            })
            .catch((error) => {
                this.setState({
                    reservationState: FAILED_STATE
                })
            })
    }

    /*
     * Callback function for "add guest" button on UI.
     * Adds one guest text input field to the UI.
     */
    addGuestInput(){
        let { guests, errorMessages } = this.state
        if (guests.length >= MAX_GUESTS_PER_RESERVATION){
            return
        }
        guests.push({ name: "", kid: false })
        errorMessages.guests.push(false)
        this.setState({
            errorMessages: errorMessages,
            guests: guests
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

    componentDidMount(){
        const { currentWeekId } = this

        // Download all reservations for current week to get available space.
        // We need to do this since there is no backend support :/
        Firebase.database().ref(`/${currentWeekId}`).on('value', snapshot => {
            const { currentWeek } = this.state
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
                    // Kids should not be taken in consideration
                    currentGuests = currentGuests + guestsFound.length - kidsCount
                }

                currentWeek[currentWeekId][dayRef].space = currentGuests
            }

            this.setState({
                currentWeek: currentWeek
            })
        })
    }

    render() {
        const { defaultCapacity } = this.props
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
        const availableSpace = reservationDate ?
            defaultCapacity - currentWeek[currentWeekId][reservationDate].space : 0
        return (
            <div className="register-form">
                <div className="register-form__date-selection-container">
                    <CustomDayPicker
                        currentWeek={ currentWeek }
                        selectedDay={ reservationDate }
                        defaultCapacity={ defaultCapacity }
                        onDateSelected={ handleDateChange }
                        disabled={ reservationState === COMPLETED_STATE }
                    />
                </div>

                <div className="register-form__guest_input_container">
                    <GuestsInputForm
                        personalData={ personalData }
                        guests={ guests }
                        errorMessages={ errorMessages }
                        disabled={
                            reservationState === COMPLETED_STATE ||
                            availableSpace <= 0
                        }
                        handlePersonalDataChange={ handlePersonalDataChange }
                        handleGuestInputChange={ handleInputChange }
                        onClickAddGuest={ addGuestInput }
                        handleKidChange={ handleKidChange }
                    />
                </div>

                <div className="register-form__button-add-reserve-container">
                    <input 
                        type="button" 
                        className="button-add-reserve"
                        value={ RESERVATION_BUTTON }
                        disabled={
                            reservationState === COMPLETED_STATE ||
                            availableSpace <= 0
                        }
                        onClick={ createReservation }
                    />
                </div>

                <div>
                {
                    ![PENDING_STATE, UNAVAILABLE_STATE].includes(reservationState) ?
                            <div className="reservation-result-block">
                                <div>
                                    {
                                        reservationState === COMPLETED_STATE ?
                                        <p>
                                            { RESERVATION_SUCCESS }
                                            <FaCheckCircle className="icon-check-circle"/>
                                        </p> :
                                        <p>
                                            { RESERVATION_FAILED }
                                            <FaTimesCircle className="icon-fail-circle"/>
                                        </p>
                                    }
                                </div>
                                {
                                    reservationState === COMPLETED_STATE ?
                                        <div>
                                            <div className="reservation-number-block-warning">
                                                { RESERVATION_WARNING }
                                            </div>
                                            <div>
                                                Código de reservación: { reservationId }
                                            </div>
                                        </div> :
                                        <div className="reservation-number-block-error">
                                            { getReservationErrors() }
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
