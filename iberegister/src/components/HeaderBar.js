import React, { Component } from 'react'
import { FaCalendarPlus, FaEdit } from 'react-icons/fa'


class HeaderBar extends Component {
    render() {
        const {highlightReservation, handleReservation, handleEdit} = this.props
        return (
            <div class="topnav">
              <label type="button" class={highlightReservation ? "active": "inactive"} onClick={handleReservation}><FaCalendarPlus/> Crear reservacion</label>
              <label type="button" class={highlightReservation ? "inactive": "active"} onClick={handleEdit} ><FaEdit/> Editar reservacion</label>
            </div>
        )
    }
}

export default HeaderBar