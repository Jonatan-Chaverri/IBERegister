import React, { Component } from 'react'
import {nextAvailableDate, isAvailableReservation} from '../utils'

class CustomRadioButton extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = [""]
        this.datesOptions[0] = nextAvailableDate()
        this.datesOptions[1] = "Asamblea 2021-1-19"
    }

    render(){
        const {selectedDate, onDateSelected, disabled} = this.props
        const {datesOptions} = this
        return(
            <div className="custom-date-picker">
            <div className="custom-header-text">Fecha de reservación</div>
             <tbody>
            {
                datesOptions.map( optionDate => {
                    return (
                        <tr class="radio-table-row">
                            <td>
                                <label class="radio-label">
                                    <input 
                                        type="radio" 
                                        name={optionDate}
                                        value={optionDate}
                                        id={optionDate}
                                        checked={selectedDate === optionDate}
                                        onChange={onDateSelected}
                                        className="custom-radio" />
                                    <label 
                                        htmlFor={optionDate}
                                        class={selectedDate === optionDate ? "radio-label-selected": "radio-label"}>
                                        {optionDate}
                                    </label>
                                </label>
                            </td>
                        </tr>
                    )
                })
            }
            </tbody>
            <hr width="250px" align="left"></hr>
            </div>
        )
    }
}

export default CustomRadioButton