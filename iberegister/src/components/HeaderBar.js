import React, { Component } from 'react'
import { FaCalendarPlus, FaEdit } from 'react-icons/fa'


class HeaderBar extends Component {
    render() {
        return (
            <div class="topnav">
              <a class="active" href="#home"><FaCalendarPlus/> Crear reservacion</a>
              <a href="#cancellation"><FaEdit/> Editar reservacion</a>
            </div>
        )
    }
}

export default HeaderBar