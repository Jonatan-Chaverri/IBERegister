import React, { Component } from 'react'
import Datepicker from 'react-datepicker'

class CustomDatePicker extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = ["", "", "", ""]
        const currentDate = new Date()
        var y, m, d
        for (let dateIndex in this.datesOptions){
            currentDate.setDate(currentDate.getDate() + (14-currentDate.getDay()) % 7)
            y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(currentDate);
            m = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(currentDate);
            d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(currentDate);
            this.datesOptions[dateIndex] = `${y}-${m}-${d}`
            currentDate.setDate(currentDate.getDate() + 1)
        }
    }

    render(){
        const {selectedDate, onDateSelected} = this.props
        const {datesOptions} = this
        return(
            <div class="custom-date-picker">
                <div class="custom-header-text">Fecha de reservacion</div>
                <select class="select-css" value={selectedDate} onChange={onDateSelected}>
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