import React, { Component } from 'react'

class GuestsInputForm extends Component {

    constructor(props) {
        super(props)
    }

    render(){
        const {
            personalData,
            guests,
            errorMessages,
            disabled,
            handlePersonalDataChange,
            handleGuestInputChange,
            onClickAddGuest
        } = this.props
        return(
            <div class="guest-reservation-block">
                <div class="personal-data-block">
                    <div class="custom-header-text">Datos personales</div>
                    <table>
                        <tr>
                            <th>Nombre</th>
                            <th className={errorMessages.personalDataName ? "input-error" : ""}><input 
                                type="text"
                                value={personalData.name}
                                disabled={disabled}
                                onChange={
                                    event => handlePersonalDataChange(
                                        event.target.value,
                                        personalData.phone
                                    )
                                }/></th>
                        </tr>
                        <tr>
                            <th>Teléfono</th>
                            <th className={errorMessages.personalDataPhone ? "input-error" : ""}><input 
                                type="text"
                                value={personalData.phone}
                                disabled={disabled}
                                onChange={
                                    event => handlePersonalDataChange(
                                        personalData.name,
                                        event.target.value
                                    )
                                }/></th>
                        </tr>
                    </table>
                </div>
                <div class="guests-block">
                    <div class="custom-header-text">Nombres de acompañantes</div>
                    <div>
                    {
                        guests.map((guest, index) => {
                                return (
                                    <div class={errorMessages.guests[index] ? "input-error" : "input-block"}>
                                        <input 
                                            type="text"
                                            value={guest}
                                            disabled={disabled}
                                            onChange={
                                                event => handleGuestInputChange(index, event.target.value)
                                            }
                                        /><br/>
                                    </div>
                                )
                            }
                        )
                    }
                        <input 
                            type="button"
                            value="+"
                            class="button-add-more"
                            disabled={guests.length >= 10 || disabled}
                            onClick={onClickAddGuest}></input><br/><br/>
                    </div>
                </div>
            </div>
        )
    }

}
export default GuestsInputForm