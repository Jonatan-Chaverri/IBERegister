import React, { Component } from 'react'


class HeaderBar extends Component {
    render() {
        return (
            <div class="topnav">
              <a class="active" href="#home">Crear reservacion</a>
              <a href="#cancellation">Editar reservacion</a>
            </div>
        )
    }
}

export default HeaderBar