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
            reservationDate: `${y}-${m}-${d}`
        }
        this.handleDateChange = this.handleDateChange.bind(this)
    }

    handleDateChange(event){
        this.setState({
            reservationDate: event.target.value
        })
    }

    render(){
        const {reservationDate} = this.state
        const {handleDateChange} = this
        return(
            <div class="registerForm">
                <div class="date-selection-block">
                    <CustomDatePicker selectedDate={reservationDate} onDateSelected={handleDateChange}/>
                </div>
            </div>
        )
    }

}

export default EditReservationForm