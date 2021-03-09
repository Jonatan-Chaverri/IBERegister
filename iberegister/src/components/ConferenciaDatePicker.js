import React, { Component } from 'react'
import {nextAvailableDate, isAvailableReservation} from '../utils'

class ConferenciaDatePicker extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = [""]
        this.datesOptions = [
            'Jueves 18/03',
            'Viernes 19/03',
            'Sabado 20/03',
            'Domingo 21/03'
        ]
    }

    render(){
        const {selectedDates, availableDates, onDateSelected, disabled} = this.props
        const confDays = ['Jueves(18-3)', 'Viernes(19-3)', 'Sabado(20-3)', 'Domingo(21-3)']
        const {datesOptions} = this
        return(
            <div className="custom-date-picker">
                <div className="custom-header-text">Escoja los días que desea asistir</div>
                <tbody>
                {
                    confDays.map( optionDate => {
                        return (
                            <tr class="checkbox-table-row">
                                <td>
                                    <label class="radio-label">
                                        <input
                                            type="checkbox"
                                            name={optionDate}
                                            value={optionDate}
                                            id={optionDate}
                                            checked={selectedDates.includes(optionDate)}
                                            onChange={onDateSelected}
                                            disabled={disabled}
                                            className="custom-checkbox" />
                                        <label
                                            htmlFor={optionDate}
                                            class={selectedDates.includes(optionDate) ? "custom-checkbox": "custom-checkbox"}>
                                                <div className="inline-text">{optionDate}</div>
                                                {
                                                    availableDates ?
                                                    <div className="inline-text-red">
                                                        {`(quedan ${availableDates[optionDate]} espacios)`}
                                                    </div> : <div></div>
                                                }
                                        </label>
                                    </label>
                                </td>
                            </tr>
                        )
                    })
                }
                </tbody>
            </div>
        )
    }
}

export default ConferenciaDatePicker
