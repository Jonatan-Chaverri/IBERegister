import React, { Component } from 'react'

import Firebase from "firebase/app"

import AdminHeaderBar from '../components/AdminHeaderBar'
import AdminSettings from '../components/AdminSettings'
import AdminReservationsDisplay from '../components/AdminReservationsDisplay'

import { getCurrentWeek } from '../utils'


class Admin extends Component {

    constructor(props){
        super(props)

        const currentWeekInfo = getCurrentWeek()
        this.currentWeekId = Object.keys(currentWeekInfo)[0]
        const datesOptions = Object.keys(currentWeekInfo[this.currentWeekId])
            .map(dayId => {
                return currentWeekInfo[this.currentWeekId][dayId].label
            })

        this.state = {
            currentWeekReservations: {},
            currentWeek: currentWeekInfo,
            reservationDate: datesOptions[0],
            datesOptions: datesOptions,
            reservations: {},
            activeTabIndex: 0,
            defaultCapacity: 0
        }

        this.handleDateChange = this.handleDateChange.bind(this)
        this.handleCheckReservations = this.handleCheckReservations.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.handleDisplaySettings = this.handleDisplaySettings.bind(this)
    }

    /*
     * Callback function for when there is a change in selected date
     */
    handleDateChange(selectedDate){
        this.setState({
            reservationDate: selectedDate
        })
    }


    /*
     * Callback function for when user clicks on "reservations" tab on header
     * menu
     */
    handleCheckReservations(){
        this.setState({ activeTabIndex: 0})
    }

    /*
     * Callback function for when user clicks on "settings" tab on header menu
     */
    handleDisplaySettings(){
        this.setState({ activeTabIndex: 1})
    }

    /*
     * Callback function for when user clicks on "logout" tab on header menu
     */
    handleLogout(){
        localStorage.clear()
        this.props.history.push('/login')
    }

    componentDidMount(){
        const { currentWeekId } = this

        Firebase.database().ref(`/${currentWeekId}`).on('value', snapshot => {
            var weekRef = snapshot.val();
            if (weekRef == null){
                weekRef = {}
            }
            this.setState({
                currentWeekReservations: weekRef
            })
        })

        Firebase.database().ref("/settings").on('value', snapshot => {
            const settings = snapshot.val();
            this.setState({
                defaultCapacity: settings.capacity
            })
        })
    }

    render(){
        const {
            currentWeek,
            datesOptions,
            currentWeekReservations,
            activeTabIndex,
            defaultCapacity
        } = this.state
        const {
            currentWeekId,
            handleCheckReservations,
            handleDisplaySettings,
            handleLogout
        } = this
        return(
            <div>
                <AdminHeaderBar
                    onCheckReservations={ handleCheckReservations }
                    onSettings={ handleDisplaySettings }
                    onLogout={ handleLogout }
                    activeTab={ activeTabIndex }
                />
                {
                    activeTabIndex === 0 ?
                    <div className="admin__reservations-display">
                        <AdminReservationsDisplay
                            currentWeek={ currentWeek }
                            currentWeekId={ currentWeekId }
                            defaultCapacity={ defaultCapacity }
                            datesOptions={ datesOptions }
                            currentWeekReservations={ currentWeekReservations }
                        />
                    </div> :
                    activeTabIndex === 1 ?
                    <div className="admin__settings-block">
                        <AdminSettings
                            defaultCapacity={ defaultCapacity }
                        />
                    </div>
                    : <div></div>
                }
            </div>
        )
    }
}

export default Admin
