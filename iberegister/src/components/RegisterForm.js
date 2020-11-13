import React, { Component } from 'react'
import Datepicker from 'react-datepicker'
import Firebase from 'firebase'
import { v4 } from 'uuid';

// Check more icons at here https://react-icons.github.io/react-icons/icons?name=fa
import { FaCheckCircle } from 'react-icons/fa'

import "react-datepicker/dist/react-datepicker.css";


class RegisterForm extends Component {

    constructor(props) {
        super(props)

        this.state = {
            reservationDate: "",
            datesOptions: [""],
            guests: ["","",""],
            personalData: {
                "name": "",
                "phone": ""
            },
            reservationId: v4().substring(0, 4),
            reservationState: "pending",
            errorMessages: [""]
        }
        this.addGuestInput = this.addGuestInput.bind(this)
        this.reservationDateToString = this.reservationDateToString.bind(this)
        this.getDatabaseUrl = this.getDatabaseUrl.bind(this)
        this.createReservation = this.createReservation.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.getNextFourSundays = this.getNextFourSundays.bind(this)
        this.handleDateChange = this.handleDateChange.bind(this)
        this.handlePersonalDataChange = this.handlePersonalDataChange.bind(this)
    }

    getNextFourSundays(){
        const {reservationDateToString} = this
        const datesArray = ["", "", "", ""]
        const currentDate = new Date()
        for (let dateIndex in datesArray){
            currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
            datesArray[dateIndex] = reservationDateToString(currentDate)
            currentDate.setDate(currentDate.getDate() + 1)
        }
        return datesArray
    }

    isValidName(name){
        const regex = /^[A-Za-z]{1,15}\s[A-Za-z]{1,15}(\s[A-Za-z]{1,15}$|$)/
        return regex.test(name)
    }

    isValidPhone(phone){
        const regex = /^[0-8]{8}$/
        return regex.test(phone)
    }

    validateReservation(){
        const {personalData, guests} = this.state

    }

    createReservation(){
        const {guests} = this.state
        const {getDatabaseUrl} = this
        const dbUrl = getDatabaseUrl()
        let ref = Firebase.database().ref(dbUrl)

        ref.on('value', snapshot => {
            const {reservationState} = this.state
            if (reservationState == "completed"){
                return
            }
            const value = snapshot.val();
            if (value != null) {
                // There is some other reservation with same code
                // Generate a new one and test again
                const new_reservation_id = v4().substring(0, 4)
                this.setState({
                    reservationId: v4().substring(0, 4)
                });
                this.createReservation()
            }
            else {
                // Reservation ID is unique, create reservation
                var filtered = guests.filter(el => {return el.length > 0})
                let guestStr = filtered.toString()
                ref.set(guestStr)
                this.setState({
                    reservationState: "completed"
                })
            }
        })
    }

    reservationDateToString(dateInput){
        const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(dateInput);
        const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(dateInput);
        const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(dateInput);
        return `${y}-${m}-${d}`
    }

    getDatabaseUrl(){
        const {reservationId, reservationDate} = this.state
        const databaseUrl = `/${reservationDate}/${reservationId}/guests`
        return databaseUrl
    }

    addGuestInput(){
        let {guests} = this.state
        if (guests.length >= 10){
            // TODO add error message
            return
        }
        guests.push("")
        this.setState({
            guests: guests,
        })
    }

    handleInputChange(index, value){
        let {guests} = this.state
        guests[index] = value
        this.setState({
            guests: guests
        })
    }

    handleDateChange(event){
        this.setState({
            reservationDate: event.target.value
        })
    }

    handlePersonalDataChange(nameValue, phoneValue){
        this.setState({
            personalData: {
                name: nameValue,
                phone: phoneValue.replace("-", "").replace(" ", "")
            }
        })
    }

    componentDidMount(){
        const {getNextFourSundays} = this
        const datesOptions = getNextFourSundays()
        this.setState({
            datesOptions: datesOptions,
            reservationDate: datesOptions[0]
        })
    }

    render() {
        const {reservationDate, guests, datesOptions, personalData} = this.state
        const {
            addGuestInput,
            createReservation,
            handleInputChange,
            getNextFourSundays,
            handleDateChange,
            handlePersonalDataChange
        } = this
        return (
            <div class="registerForm">
                <div class="date-selection-block">
                    <div class="custom-header-text">Fecha de reservacion</div>
                    <select class="select-css" value={reservationDate} onChange={handleDateChange}>
                    {
                        datesOptions.map(el => {
                            return (<option value={el}>{el}</option>)
                        })
                    }
                    </select>
                    <div class="custom-subtitle">Quedan 70 campos</div>
                </div>
                <div class="guest-reservation-block">
                    <div class="personal-data-block">
                        <div class="custom-header-text">Datos personales</div>
                        <table>
                            <tr>
                                <th>Nombre</th>
                                <th><input 
                                    type="text"
                                    value={personalData.name}
                                    onChange={
                                        event => handlePersonalDataChange(
                                            event.target.value,
                                            personalData.phone
                                        )
                                    }/></th>
                            </tr>
                            <tr>
                                <th>Telefono</th>
                                <th><input 
                                    type="text"
                                    value={personalData.phone}
                                    onChange={
                                        event => handlePersonalDataChange(
                                            personalData.name,
                                            event.target.value
                                        )
                                    }/></th>
                            </tr>
                        </table>
                    </div>
                    <div class="guests-block">
                        <div class="custom-header-text">Nombres de acompanantes</div>
                        <div>
                        {
                            guests.map((guest, index) => {
                                    return (
                                        <div class="input-block">
                                            <input 
                                                type="text"
                                                value={guest}
                                                onChange={
                                                    event => handleInputChange(index, event.target.value)
                                                }
                                            /><br/>
                                        </div>
                                    )
                                }
                            )
                        }
                            <input type="button" value="+" class="button-add-more" onClick={addGuestInput}></input><br/><br/>
                        </div>

                    </div>
                </div>
                <div>
                    <input type="button" class="button-add-reserve" value="Reservar" onClick={createReservation}></input>
                </div>
                <div class="reservation-result-block-container">
                    <div class="reservation-result-block">
                        <div class="reservation-status-block">
                            <p>Reservacion exitosa  <FaCheckCircle class="icon-check-circle"/></p>
                        </div>
                        <div class="reservation-number-block">
                            <div class="reservation-number-block-warning">
                                **Es importante que anotes este numero de reservacion, asi como
                                el dia de la misma, en caso de que quieras hacer cambios despues
                            </div>
                            <div>
                                Numero de reservacion: 333
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default RegisterForm