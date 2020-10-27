import React, { Component } from 'react'
import Datepicker from 'react-datepicker'

import "react-datepicker/dist/react-datepicker.css";


class RegisterForm extends Component {
    render() {
        return (
            <div class="registerForm">
                <table class="registerTable">
                    <tr>
                        <th width="50%">Fecha de reservacion</th>
                        <th width="50%"><Datepicker selected={new Date()}/></th>
                    </tr>
                </table>
                <div>
                    <h5>Nombre completo de todas las personas que vendran con ud</h5>
                    <form action="">
                        <input type="text"></input><br/>
                        <input type="text"></input><br/>
                        <input type="text"></input><br/>
                        <input type="button" value="+anadir mas"></input><br/><br/>
                        <input type="submit" value="Reservar"></input>
                    </form>

                </div>

            </div>
        )
    }
}

export default RegisterForm