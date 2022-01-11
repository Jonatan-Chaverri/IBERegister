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
            onClickAddGuest,
            handleKidChange
        } = this.props
        return(
            <div>
                <div className="guest-input-form__personal-data-container">
                    <div className="section-title">Datos personales</div>
                    <table>
                        <tbody>
                            <tr>
                                <td><div>&nbsp;</div></td>
                            </tr>
                            <tr>
                                <th className="guest-input-form__left-title">
                                    Nombre completo
                                </th>
                                <th
                                    className={
                                        errorMessages.personalDataName ?
                                        "guest-input-form__input-error-container" :
                                        "guest-input-form__input-block"
                                    }
                                >
                                    <div className="guest-input-form__input-error">
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
                                <th className="guest-input-form__left-title">Teléfono</th>
                                <th
                                    className={
                                        errorMessages.personalDataPhone ?
                                        "guest-input-form__input-error-container" :
                                        "guest-input-form__input-block"
                                    }
                                >
                                    <div className="guest-input-form__input-error">
                                        <input
                                            type="text"
                                            className="text-input"
                                            value={ personalData.phone }
                                            disabled={ disabled }
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
                        </tbody>
                    </table>
                </div>

                <div className="guest-input-form__guests-container">
                    <div className="section-title">Nombres de acompañantes</div>

                    <table>
                        <tbody>
                            <tr>
                                <th></th>
                                <th className="table-left small-title">Niño(a) 8 - 12 años</th>
                            </tr>
                        {
                            guests.map((guest, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <div className={
                                                        errorMessages.guests[index] ?
                                                        "guest-input-form__input-error-container" :
                                                        "guest-input-form__input-block"
                                                    }
                                                >
                                                    <div className="guest-input-form__input-error">
                                                        <input
                                                            type="text"
                                                            value={ guest.name }
                                                            className="text-input"
                                                            disabled={ disabled }
                                                            onChange={
                                                                event =>
                                                                handleGuestInputChange(index, event.target.value)
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-checkbox"
                                                        checked={ guest.kid }
                                                        onChange={
                                                            event => handleKidChange(index)
                                                        }
                                                        disabled={disabled}
                                                    />
                                                  <span className="checkmark"/>
                                                </label>
                                            </td>
                                        </tr>
                                    )
                                }
                            )
                        }
                        </tbody>
                    </table>
                    <input
                        type="button"
                        value="+ Añadir"
                        className="guest-input-form__button-add-more"
                        disabled={ guests.length >= 10 || disabled }
                        onClick={ onClickAddGuest }
                    />
                </div>
            </div>
        )
    }

}

export default GuestsInputForm
