import React, { Component } from 'react'

class CustomDayPicker extends Component {

    render(){
        const {currentWeek, selectedDay, onDateSelected, disabled} = this.props
        const weekNumber = Object.keys(currentWeek)[0]
        return(
            <div>
                <div className="custom-header-text">Fecha de reservación</div>
                <div className="container-day-picker">
                {
                    Object.keys(currentWeek[weekNumber]).map(dayId => {
                        return (
                        <div className="day-picker-container">
                             <div
                                className={
                                    selectedDay === dayId ?
                                    'day-selection-selected' :
                                    currentWeek[weekNumber][dayId].available ?
                                    'day-selection': 'day-selection-disabled'
                                }
                                onClick={
                                    event => disabled ?
                                    null : currentWeek[weekNumber][dayId].available ?
                                    onDateSelected(dayId) : null
                                }
                            >
                                <div>
                                    {currentWeek[weekNumber][dayId].label}
                                </div>
                                {
                                    currentWeek[weekNumber][dayId].available ?
                                    <div className="available-space-text">
                                        {
                                            `(Disponible: ${currentWeek[weekNumber][dayId].space})`
                                        }
                                    </div> : <div className="not-available-text">(no disponible)</div>
                                }
                            </div>
                        </div>
                        )
                    })
                }
                </div>
            </div>
        )
    }
}

export default CustomDayPicker
