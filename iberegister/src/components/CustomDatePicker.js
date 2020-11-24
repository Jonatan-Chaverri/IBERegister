import React, { Component } from 'react'
import Datepicker from 'react-datepicker'
import {nextAvailableDate} from '../utils'

class CustomDatePicker extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = ["", "", "", ""]
        var currentDate = new Date()
        for (let dateIndex in this.datesOptions){
            this.datesOptions[dateIndex] = nextAvailableDate(currentDate)
        }
    }

    render(){
        const {selectedDate, onDateSelected, disabled} = this.props
        const {datesOptions} = this
        return(
            <div class="custom-date-picker">
                <div class="custom-header-text">Fecha de reservación</div>
                <select class="select-css" value={selectedDate} onChange={onDateSelected} disabled={disabled}>
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