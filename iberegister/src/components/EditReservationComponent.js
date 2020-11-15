import React, { Component } from 'react'
import Firebase from 'firebase'
import {MAX_ALLOWED_GUESTS} from "../config"
import CustomDatePicker from './CustomDatePicker'
import GuestsInputForm from './GuestsInputForm'

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

import "react-datepicker/dist/react-datepicker.css";


class EditReservationForm extends Component {

    constructor(props) {
        super(props)
        
        // The initial reservation date is always next sunday
        const currentDate = new Date()
        currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
        const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
        const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(currentDate);
        const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);

        this.state = {
            guests: ["","",""],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: "",
            updateState: "pending",
            reservationDate: `${y}-${m}-${d}`,
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
        const {reservationId, reservationDate} = this.state
        if (reservationId.length < 9){
            this.setState({
                guests: ["","",""],
                personalData: {
                    name: "",
                    phone: ""
                },
                updateState: "pending",
                errorMessages: {
                    personalDataName: false,
                    personalDataPhone: false,
                    guests: [false, false, false],
                    notAvailableSpace: false,
                    reservationNotFound: false,
                    reservationNotValid: true
                }
            })
            return
        }
        const dbUrl = `/${reservationDate}/${reservationId}`
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            var reservation = snapshot.val();
            if (reservation == null){
                this.setState({
                    guests: ["","",""],
                    personalData: {
                        name: "",
                        phone: ""
                    },
                    updateState: "pending",
                    errorMessages: {
                        personalDataName: false,
                        personalDataPhone: false,
                        guests: [false, false, false],
                        notAvailableSpace: false,
                        reservationNotFound: true,
                        reservationNotValid: false
                    }
                })
                return
            }
            const guestsFound = reservation.guests.replace(reservation.name, "").split(",")
            this.setState({
                guests: guestsFound,
                personalData: {
                    name: reservation.name,
                    phone: reservation.phone
                },
                updateState: "found",
                errorMessages: {
                    personalDataName: false,
                    personalDataPhone: false,
                    guests: Array(guestsFound.length).fill(false),
                    notAvailableSpace: false,
                    reservationNotFound: false,
                    reservationNotValid: false
                }
            })

        })


    }

    isValidName(name){
        const regex = /^[A-Za-z]{1,15}\s[A-Za-z]{1,15}(\s[A-Za-z]{1,15}$|$)/
        return regex.test(name)
    }

    isValidPhone(phone){
        const regex = /^[0-8]{8}$/
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
            return "No hay espacio disponible para todos los invitados"
        }
        if (errorMessages.personalDataName || !personalData.name){
            return "El nombre que introdujo en datos personales no es valido"
        }
        if (errorMessages.personalDataPhone || !personalData.phone){
            return "El telefono que introdujo en datos personales no es valido"
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
                updateState: "failed"
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
            console.log("available spaces are "+availableSpace)
            var filtered = guests.filter(el => {return el.length > 0})
            filtered.push(personalData.name)
            if (filtered.length > availableSpace){
                errorMessages.notAvailableSpace = true
                this.setState({
                    updateState: "failed",
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
                updateState: "completed"
            })
        })
    }

    handleClickDelete(){
        const {reservationDate, reservationId} = this.state
        const dbUrl = `/${reservationDate}/${reservationId}`
        Firebase.database().ref(dbUrl).remove()
        this.setState({
            updateState: "deleted"
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
                        <div class="custom-header-text">Codigo de reservacion</div>
                        <input type="text" value={reservationId} onChange={handleReservationChange}/>
                    </div>
                </div>
                <div class="main-block">
                    <input class="button-add-reserve" type="button" value="Buscar" onClick={handleClickSearch} disabled={["completed", "deleted"].includes(updateState)}/>
                </div>
                <div class="error-message">
                {
                    errorMessages.reservationNotFound ?
                        <div>La reservacion no existe <FaTimesCircle class="icon-fail-circle"/></div>
                         : errorMessages.reservationNotValid ?
                            <div>El codigo de reservacion no es valido <FaTimesCircle class="icon-fail-circle"/></div> :
                            <div>&nbsp;</div>
                }
                </div>
                <GuestsInputForm
                    personalData={personalData}
                    guests={guests}
                    errorMessages={errorMessages}
                    disabled={["pending", "completed", "deleted"].includes(updateState)}
                    handlePersonalDataChange={handlePersonalDataChange}
                    handleGuestInputChange={handleInputChange}
                    onClickAddGuest={addGuestInput}
                />
                <div class="main-block">
                    <div class="main-block horizontal-block">
                        <input 
                            class="button-add-reserve"
                            type="button"
                            value="Actualizar"
                            disabled={["pending", "completed", "deleted"].includes(updateState)}
                            onClick={handleClickUpdate}/>
                    </div>
                    <div class="main-block horizontal-block">
                        <input
                        class="button-warning"
                        type="button"
                        value="Eliminar reserva"
                        disabled={["pending", "completed", "deleted"].includes(updateState)}
                        onClick={handleClickDelete}
                    />
                    </div>
                </div>
                <div>
                    {
                        updateState == "failed" ? <div class="error-message">{getReservationErrors()}</div> :
                        updateState == "completed"? <div class="text-success">Se ha actualizado su reserva <FaCheckCircle class="icon-check-circle"/></div> :
                        updateState == "deleted" ?  <div class="text-error">Se ha eliminado su reserva <FaCheckCircle class="icon-check-circle"/></div> :
                        <div> &nbsp;</div>
                    }
                </div>
            </div>
        )
    }

}

export default EditReservationForm