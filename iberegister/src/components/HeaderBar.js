import React, { Component } from 'react'


class HeaderBar extends Component {
    render() {
        return (
            <div class="topnav">
              <a class="active" href="#home">Reserva de cupos</a>
              <a href="#cancellation">Cancelar reservacion</a>
            </div>
        )
    }
}

export default HeaderBar