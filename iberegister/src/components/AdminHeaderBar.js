import React, { Component } from 'react'

import {
    FaCalendarPlus,
    FaWrench,
    FaSignInAlt,
    FaBars
} from 'react-icons/fa'

import { RESERVATIONS_MENU, SETTINGS_MENU, LOGOUT_MENU } from '../strings'


class AdminHeaderBar extends Component {

    constructor(props){
        super(props)

        this.state = {
            showMenu: window.innerWidth < 575,
            isMenuOpen: false
        }

        this.displayMenu = this.displayMenu.bind(this)
        this.openCloseMenu = this.openCloseMenu.bind(this)
    }

    /*
     * Event Listener function to display menu in case screen size is resize
     * to less than 575px
     */
    displayMenu(){
        this.setState({
            showMenu: window.innerWidth < 575,
            isMenuOpen: false
        })
    }

    /*
     * Callback function for when user clicks on menu icon
     */
    openCloseMenu(){
        const { isMenuOpen } = this.state
        this.setState({
            isMenuOpen: !isMenuOpen
        })
    }

    componentDidMount(){
        const { displayMenu } = this
        window.addEventListener('resize', displayMenu)
    }

    render() {
        const {
            onCheckReservations,
            onSettings,
            onLogout,
            activeTab
        } = this.props
        const { showMenu, isMenuOpen } = this.state
        const { openCloseMenu } = this
        return (
            <div>
            {
                showMenu ?
                <div className="header-menu admin-header">
                    <label
                      type="button"
                      className={ activeTab === 1 ? "active": "inactive" }
                      onClick={ openCloseMenu }>
                      <FaBars/>
                    </label>
                </div> :
                <div className="header-menu admin-header">
                    <label
                      type="button"
                      className={ activeTab === 0 ? "active": "inactive" }
                      onClick={ onCheckReservations }>
                      <FaCalendarPlus/> { RESERVATIONS_MENU }
                    </label>
                    <label
                      type="button"
                      className={ activeTab === 1 ? "active": "inactive" }
                      onClick={ onSettings }>
                      <FaWrench/> { SETTINGS_MENU }
                    </label>
                    <label
                      type="button"
                      className={ activeTab === 2 ? "active": "inactive" }
                      onClick={ onLogout } >
                      <FaSignInAlt/> { LOGOUT_MENU }
                    </label>
                </div>
            }
                <div
                    className={
                        isMenuOpen ? "admin-header__side-menu" :
                            "admin-header__side-menu-closed"
                    }
                >
                    <label
                      type="button"
                      className="admin-header__side-menu-item"
                      onClick={ (event) => {
                            openCloseMenu()
                            return onCheckReservations()
                        }
                      }
                    >
                      <FaCalendarPlus/> { RESERVATIONS_MENU }
                    </label>
                    <label
                      type="button"
                      className="admin-header__side-menu-item"
                      onClick={ (event) => {
                            openCloseMenu()
                            return onSettings()
                        }
                      }
                    >
                      <FaWrench/> { SETTINGS_MENU }
                    </label>
                    <label
                      type="button"
                      className="admin-header__side-menu-item"
                      onClick={ (event) => {
                            openCloseMenu()
                            return onLogout()
                        }
                      }
                    >
                      <FaSignInAlt/> { LOGOUT_MENU }
                    </label>
                </div>
            </div>
        )
    }
}

export default AdminHeaderBar
