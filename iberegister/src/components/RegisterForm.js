import React, { Component } from 'react'
import Datepicker from 'react-datepicker'
import Firebase from 'firebase'
import { v4 } from 'uuid';

import "react-datepicker/dist/react-datepicker.css";


class RegisterForm extends Component {

    constructor(props) {
        super(props)

        const nextSunday = new Date()
        nextSunday.setDate(nextSunday.getDate() + (14-nextSunday.getDay()) % 7)
        this.state = {
            reservationDate: nextSunday,
            guests: ["","",""],
            reservationId: v4().substring(0, 4),
            reservationState: "pending"
        }
        this.addGuestInput = this.addGuestInput.bind(this)
        this.reservationDateToString = this.reservationDateToString.bind(this)
        this.getDatabaseUrl = this.getDatabaseUrl.bind(this)
        this.createReservation = this.createReservation.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
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

    reservationDateToString(){
        const {reservationDate} = this.state
        const y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(reservationDate);
        const m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(reservationDate);
        const d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(reservationDate);
        return `${y}-${m}-${d}`
    }

    getDatabaseUrl(){
        const {reservationId} = this.state
        const {reservationDateToString} = this
        const databaseUrl = `/${reservationDateToString()}/${reservationId}/guests`
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

    render() {
        const {reservationDate, guests} = this.state
        const {addGuestInput, createReservation, handleInputChange} = this
        return (
            <div class="registerForm">
                <table class="registerTable">
                    <tr>
                        <th width="50%">Fecha de reservacion</th>
                        <th width="50%"><Datepicker selected={reservationDate}/></th>
                    </tr>
                </table>
                <div>
                    <h5>Nombre completo de todas las personas que vendran con ud</h5>
                    <div>
                    {
                        guests.map((guest, index) => {
                                return (
                                    <div>
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
                        <input type="button" value="+anadir mas" onClick={addGuestInput}></input><br/><br/>
                        <input type="button" value="Reservar" onClick={createReservation}></input>
                    </div>

                </div>

            </div>
        )
    }
}

export default RegisterForm