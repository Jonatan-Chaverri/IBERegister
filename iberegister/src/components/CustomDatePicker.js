import React, { Component } from 'react'


class CustomDatePicker extends Component {

    constructor(props) {
        super(props)
        this.datesOptions = [""]
    }

    render(){
        const {
            selectedDate,
            onDateSelected,
            datesOptions,
            disabled
        } = this.props
        return(
            <div>
                <div className="section-title">Fecha de reservación</div>
                <select
                    className="select-css"
                    value={ selectedDate }
                    onChange={ onDateSelected }
                    disabled={ disabled }
                >
                {
                    datesOptions.map(el => {
                        return (
                            <option value={ el } key={ el }>{ el }</option>
                        )
                    })
                }
                </select>
            </div>
        )
    }
}

export default CustomDatePicker
