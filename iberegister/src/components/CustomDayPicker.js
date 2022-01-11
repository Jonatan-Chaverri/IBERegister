import React, { Component } from 'react'


class CustomDayPicker extends Component {

    render(){
        const {
            currentWeek,
            selectedDay,
            onDateSelected,
            defaultCapacity,
            disabled
        } = this.props
        const weekNumber = Object.keys(currentWeek)[0]
        return(
            <div>
                <div className="section-title">Fecha de reservación</div>
                <div className="day-picker__dates_container">
                {
                    Object.keys(currentWeek[weekNumber]).map(dayId => {
                        return (
                        <div className="day-picker__date_block" key={dayId}>
                             <div
                                className={
                                    selectedDay === dayId ?
                                    'day-picker__selection-selected' :
                                    currentWeek[weekNumber][dayId].available ?
                                    'day-picker__selection': 'day-picker__selection-disabled'
                                }
                                onClick={
                                    event => disabled ?
                                    null : currentWeek[weekNumber][dayId].available ?
                                    onDateSelected(dayId) : null
                                }
                            >
                                <div>
                                    { currentWeek[weekNumber][dayId].label }
                                </div>
                                {
                                    currentWeek[weekNumber][dayId].available ?
                                    <div className="day-picker__available-space-text">
                                        {
                                            `(Disponible:
                                            ${
                                                defaultCapacity - currentWeek[weekNumber][dayId].space > 0 ?
                                                defaultCapacity - currentWeek[weekNumber][dayId].space : 0
                                            })`
                                        }
                                    </div> :
                                    <div className="day-picker__not-available-text">
                                        (no disponible)
                                    </div>
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
