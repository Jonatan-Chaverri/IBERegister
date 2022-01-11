import React, { Component } from 'react'

import jsPDF from 'jspdf'
import 'jspdf-autotable'


class ReservationsDisplay extends Component {

    constructor(props){
        super(props)
        this.state = {
            tableFilters: {
                reservationCode: true,
                name: false,
                phone: false,
                guests: true,
                timestamp: false
            }
        }
        this.generatePDF = this.generatePDF.bind(this)
        this.handleTableFilterChange = this.handleTableFilterChange.bind(this)
        this.parseTimestamp = this.parseTimestamp.bind(this)
    }

    /*
     * Exports the guests list as a PDF document
     */
    generatePDF(){
        const { reservations, reservationDate } = this.props
        const { orderReservations } = this

        const doc = new jsPDF()

        const tableColumn = ["Reserva", "Nombre", "Telefono", "Invitados"]
        const tableRows = []
        const orderedRes = orderReservations(reservations)

        orderedRes.forEach(item => {
            const reservationRow = [
                item[0],
                item[1],
                item[2],
                item[3]
            ]
            tableRows.push(reservationRow)
        })

        // Set title and margin top, margin left
        doc.text(`Reservaciones IBE ${ reservationDate }`, 14, 15)

        // StartY is margin-top
        doc.autoTable(tableColumn, tableRows, {startY:20})

        doc.save(`Reservaciones_${reservationDate}.pdf`)
    }

    /*
     * Callback function for when there is a change in table filters
     * checkbox
     */
    handleTableFilterChange(changedFilter){
        const { tableFilters } = this.state
        tableFilters[changedFilter] = !tableFilters[changedFilter]
        this.setState({
            tableFilters: tableFilters
        })
    }

    parseTimestamp(timeInfo){
        if (timeInfo == null) {
            return `-`
        }
        const date = new Date(timeInfo)

        const hour = date.getHours()
        const minutes =  date.getMinutes()
        const day = date.getDate()

        return `El ${day} a las: ${hour}:${minutes}`
    }

    /*
     * Will order a list of reservations documents per timestamp key.
     */
    orderReservations(reservations){
        const result = []
        for (var reservation in reservations){
            result.push([
                reservation,
                reservations[reservation].name,
                reservations[reservation].phone,
                reservations[reservation].guests.replaceAll(",", "\n"),
                reservations[reservation].timestamp
            ])
        }
        result.sort((a, b) => (a[4] > b[4] ? 1 : -1 ))
        return result
    }

    render(){
        const { reservations } = this.props
        const { tableFilters } = this.state
        const {
            generatePDF,
            handleTableFilterChange,
            orderReservations,
            parseTimestamp
        } = this

        const getItemClass = (rowIndex) => {
            if (rowIndex % 2){
                return "res-display__table-row-content"
            }
            return "res-display__table-row-content table-item-dark"
        }

        const orderedRes = orderReservations(reservations)
        return(
            <div>
                <div>
                    <div>
                        Mostrar columnas
                    </div>
                    <div className="res-display__table-filters-block">
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={ tableFilters.reservationCode }
                                    onClick={
                                        e => handleTableFilterChange(
                                            'reservationCode'
                                        )
                                    }
                                />
                                <span className="checkmark"/>
                                Reserva
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={ tableFilters.name }
                                    onClick={
                                        e => handleTableFilterChange('name')
                                    }
                                />
                                <span className="checkmark"/>
                                Nombre
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={ tableFilters.phone }
                                    onClick={
                                        e => handleTableFilterChange('phone')
                                    }
                                />
                                <span className="checkmark"/>
                                Telefono
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={ tableFilters.guests }
                                    onClick={
                                        e => handleTableFilterChange('guests')
                                    }
                                />
                                <span className="checkmark"/>
                                Invitados
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    checked={ tableFilters.timestamp }
                                    onClick={
                                        e => handleTableFilterChange('timestamp')
                                    }
                                />
                                <span className="checkmark"/>
                                Fecha
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <input
                        type="button"
                        onClick={ generatePDF }
                        value="Exportar a PDF"
                        className="button-add-reserve"
                    />
                    <table className="res-display__table">
                        <tr className="res-display__table-headers">
                            <th
                                className="res-display__table-small-col"
                                hidden={ !tableFilters.reservationCode }
                            >
                                Reserva
                            </th>
                            <th
                                className="res-display__table-normal-col"
                                hidden={ !tableFilters.name }
                            >
                                Nombre
                            </th>
                            <th
                                className="res-display__table-small-col"
                                hidden={ !tableFilters.phone }
                            >
                                Telefono
                            </th>
                            <th
                                className="res-display__table-normal-col"
                                hidden={ !tableFilters.guests }
                            >
                                Invitados
                            </th>
                            <th
                                className="res-display__table-small-col"
                                hidden={ !tableFilters.timestamp }
                            >
                                Fecha
                            </th>
                        </tr>
                        {
                            orderedRes.map((item, rowIndex) => {
                                return (
                                    <tr className="display-reservations-table-tr">
                                        <td
                                            className={ getItemClass(rowIndex) }
                                            hidden={ !tableFilters.reservationCode }
                                        >
                                            { item[0] }
                                        </td>
                                        <td
                                            className={ getItemClass(rowIndex) }
                                            hidden={ !tableFilters.name }
                                        >
                                            { item[1] }
                                        </td>
                                        <td
                                            className={ getItemClass(rowIndex) }
                                            hidden={ !tableFilters.phone }
                                        >
                                            { item[2] }
                                        </td>
                                        <td
                                            className={ getItemClass(rowIndex) }
                                            hidden={ !tableFilters.guests }
                                        >
                                            { item[3] }
                                        </td>
                                        <td
                                            className={ getItemClass(rowIndex) }
                                            hidden={ !tableFilters.timestamp }
                                        >
                                            { parseTimestamp(item[4]) }
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </table>
                </div>
            </div>
        )
    }
}

export default ReservationsDisplay
