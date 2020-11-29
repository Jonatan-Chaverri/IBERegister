import React, { Component } from 'react'
import {nextAvailableDate, isAvailableReservation} from '../utils'

class CustomDatePicker extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = [""]
        const nextSundayDate = nextAvailableDate()
        this.datesOptions[0] = isAvailableReservation(nextSundayDate) ? nextSundayDate : "No disponible"
    }

    render(){
        const {selectedDate, onDateSelected, disabled} = this.props
        const {datesOptions} = this
        return(
            <div className="custom-date-picker">
                <div className="custom-header-text">Fecha de reservación</div>
                <select className="select-css" value={selectedDate} onChange={onDateSelected} disabled={disabled}>
                {
                    datesOptions.map(el => {
                        return (<option value={el}>{el}</option>)
                    })
                }
                </select>
            </div>
        )
    }
}

export default CustomDatePicker