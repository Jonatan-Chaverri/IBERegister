import React, { Component } from 'react'

import CustomDatePicker from './CustomDatePicker'
import ReservationsDisplay from './ReservationsDisplay'


class AdminReservationsDisplay extends Component {

    constructor(props){
        super(props)

        this.state = {
            reservationDate: props.datesOptions[0],
            reservations: {},
            activeTabIndex: 0
        }

        this.handleDateChange = this.handleDateChange.bind(this)
    }

    /*
     * Callback function for when there is a change in selected date
     */
    handleDateChange(selectedDate){
        this.setState({
            reservationDate: selectedDate
        })
    }

    render(){
        const { reservationDate } = this.state
        const {
            currentWeek,
            currentWeekId,
            datesOptions,
            defaultCapacity,
            currentWeekReservations
        } = this.props
        const { handleDateChange } = this

        // Find reservation for selected reservations Date
        var reservations = {}
        for (var dayId in currentWeek[currentWeekId]) {
            if (currentWeek[currentWeekId][dayId].label === reservationDate) {
                reservations = currentWeekReservations[dayId] ?
                    currentWeekReservations[dayId] : {}
                break
            }
        }

        let adultsCount = 0
        let kidsCount = 0
        let resCount = 0
        for (var res in reservations) {
            resCount += 1
            const reservation = reservations[res]
            // split and analyze guests info
            const guestsFound = reservation.guests.split(",")
            for (var guest in guestsFound) {
                if (guestsFound[guest].includes('(niño)')){
                    kidsCount += 1
                } else {
                    adultsCount += 1
                }
            }
        }
        const availableSpace = defaultCapacity - adultsCount

        return(
            <div>
                <div className="admin-res__date-block">
                    <CustomDatePicker
                        selectedDate={ reservationDate }
                        datesOptions={ datesOptions }
                        onDateSelected={
                            event => handleDateChange(event.target.value)
                        }
                    />
                </div>
                <div className="admin-res__summary-block">
                    <div>
                        Total de reservaciones: { resCount }
                    </div>
                    <div>
                        Adultos: { adultsCount }
                    </div>
                    <div>
                        Ninos: { kidsCount }
                    </div>
                    <div>
                        Espacio disponible: {
                            availableSpace > 0 ? availableSpace : 0
                        }
                    </div>
                </div>

                <ReservationsDisplay
                    reservations={ reservations }
                    reservationDate={ reservationDate }
                />
            </div>
        )
    }
}

export default AdminReservationsDisplay
