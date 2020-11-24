import React, { Component } from 'react'
import Firebase from "firebase"

import CustomDatePicker from '../components/CustomDatePicker'
import FooterBar from '../components/Footer'

import logo from '../images/logo.png'

import {ADMIN_USER, ADMIN_PASSWORD} from '../config'


class ReservationsDisplay extends Component {

    render(){
        const {reservations} = this.props
        return(
            <div>
                <table class="display-reservations-table">
                    <tr className="display-reservations-table-tr">
                        <th className="display-reservations-table-th"> Reserva </th>
                        <th className="display-reservations-table-th"> Nombre </th>
                        <th className="display-reservations-table-th"> Telefono </th>
                        <th className="display-reservations-table-th"> Invitados </th>
                    </tr>
                    {
                        Object.keys(reservations).map(item => {
                            return (
                                <tr className="display-reservations-table-tr">
                                    <td className="display-reservations-table-td"> {item} </td>
                                    <td className="display-reservations-table-td"> {reservations[item].name} </td>
                                    <td className="display-reservations-table-td"> {reservations[item].phone} </td>
                                    <td className="display-reservations-table-td">
                                        {reservations[item].guests.replaceAll(",", "\n")}
                                    </td>
                                </tr>
                            )
                        })
                    }
                </table>
            </div>
        )
    }
}

export default ReservationsDisplay