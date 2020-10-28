import React, { Component } from 'react'
import Datepicker from 'react-datepicker'
import Firebase from 'firebase'

import "react-datepicker/dist/react-datepicker.css";


class RegisterForm extends Component {

    constructor(props) {
        super(props)

        const nextSunday = new Date()
        nextSunday.setDate(nextSunday.getDate() + (14-nextSunday.getDay()) % 7)
        this.state = {
            reservationDate: nextSunday,
            guests: ["","",""],
            reservationId: "rnx1"
        }
        this.addGuestInput = this.addGuestInput.bind(this)
        this.reservationDateToString = this.reservationDateToString.bind(this)
        this.getDatabaseUrl = this.getDatabaseUrl.bind(this)
        this.createReservation = this.createReservation.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
    }

    readGuestData(){
        let ref = Firebase.database().ref('/1-11-2020/rnx/guests')
        ref.on('value', snapshot => {
            const value = snapshot.val();
            this.setState({
                guests: value.split(",")
            });
        })
    }

    reservationDateToString(){
        const {reservationDate} = this.state
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(reservationDate);
        const mo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(reservationDate);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(reservationDate);
        return `${ye}-${mo}-${da}`
    }

    getDatabaseUrl(){
        const {reservationId} = this.state
        const {reservationDateToString} = this
        const databaseUrl = `/${reservationDateToString()}/${reservationId}/guests`
        return databaseUrl
    }

    createReservation(){
        const {guests} = this.state
        const {getDatabaseUrl} = this
        let guestStr = guests.toString()
        Firebase.database().ref(getDatabaseUrl()).set(guestStr);
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

    componentDidMount(){
        this.readGuestData()
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