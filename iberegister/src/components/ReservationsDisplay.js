import React, { Component } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'


class ReservationsDisplay extends Component {

    constructor(props){
        super(props)
        this.generatePDF = this.generatePDF.bind(this)
    }

    generatePDF(){
        const {reservations, reservationDate} = this.props
        const doc = new jsPDF()
        const tableColumn = ["Reserva", "Nombre", "Telefono", "Invitados"]
        const tableRows = []
        Object.keys(reservations).forEach(item => {
            const reservationRow = [
                item,
                reservations[item].name,
                reservations[item].phone,
                reservations[item].guests.replaceAll(",", "\n")
            ]
            tableRows.push(reservationRow)
        })

        // Set title and margin top, margin left
        doc.text(`Reservaciones IBE ${reservationDate}`, 14, 15)

        // StartY is margin-top
        doc.autoTable(tableColumn, tableRows, {startY:20})

        doc.save(`Reservaciones_${reservationDate}.pdf`)
    }

    render(){
        const {reservations} = this.props
        const {generatePDF} = this
        return(
            <div>
                <input type="button" onClick={generatePDF} value="Exportar a PDF" className="button-add-reserve"/>
                <table className="display-reservations-table">
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