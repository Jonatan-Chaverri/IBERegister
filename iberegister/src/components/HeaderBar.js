import React, { Component } from 'react'
import { FaCalendarPlus, FaEdit } from 'react-icons/fa'


class HeaderBar extends Component {
    render() {
        const {
            highlightReservation,
            handleReservation,
            handleEdit
        } = this.props
        return (
            <div className="header-menu">
                <label
                  type="button"
                  className={ highlightReservation ? "active": "inactive"}
                  onClick={ handleReservation }>
                  <FaCalendarPlus/> Crear reservación
                </label>
                <label
                  type="button"
                  className={ highlightReservation ? "inactive": "active"}
                  onClick={ handleEdit } >
                  <FaEdit/> Editar reservación
                </label>
            </div>
        )
    }
}

export default HeaderBar
