import React, { Component } from 'react'

class GuestsInputForm extends Component {

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
            <div className="guest-reservation-block">
                <div className="personal-data-block">
                    <div className="custom-header-text">Datos personales</div>
                    <table>
                        <tr>
                            <th className="table-left">Nombre completo</th>
                            <th className={errorMessages.personalDataName ? "input-error-container" : "input-block"}>
                            <div className="input-error">
                                <input 
                                    type="text"
                                    className="text-input"
                                    value={personalData.name}
                                    disabled={disabled}
                                    onChange={
                                        event => handlePersonalDataChange(
                                            event.target.value,
                                            personalData.phone
                                        )
                                    }
                                />
                            </div>
                            </th>
                        </tr>
                        <tr>
                            <th className="table-left">Teléfono</th>
                            <th className={errorMessages.personalDataPhone ? "input-error-container" : "input-block"}>
                            <div className="input-error">
                                <input 
                                    type="text"
                                    className="text-input"
                                    value={personalData.phone}
                                    disabled={disabled}
                                    onChange={
                                        event => handlePersonalDataChange(
                                            personalData.name,
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                            </th>
                        </tr>
                    </table>
                </div>
                <div className="guests-block">
                    <div className="custom-header-text">Nombres de acompañantes</div>
                    <div>
                    {
                        guests.map((guest, index) => {
                                return (
                                    <div className={errorMessages.guests[index] ? "input-error-container" : "input-block"}>
                                    <div className="input-error">
                                        <input 
                                            type="text"
                                            value={guest}
                                            className="text-input"
                                            disabled={disabled}
                                            onChange={
                                                event => handleGuestInputChange(index, event.target.value)
                                            }
                                        />
                                    </div>
                                    </div>
                                )
                            }
                        )
                    }
                        <input 
                            type="button"
                            value="+ Añadir"
                            className="button-add-more"
                            disabled={guests.length >= 10 || disabled}
                            onClick={onClickAddGuest}></input><br/><br/>
                    </div>
                </div>
            </div>
        )
    }

}
export default GuestsInputForm