import React, { Component } from 'react'

import Firebase from "firebase/app"

import {
    UPDATE_BUTTON,
    CAPACITY_UPDATED_SUCCESS,
    CAPACITY_UPDATED_FAILED,
    CAPACITY_TITLE,
    CAPACITY_SUBTITLE
} from '../strings'


class AdminSettings extends Component {

    constructor(props){
        super(props)
        this.state = {
            defaultCapacity: props.defaultCapacity,
            msg: ""
        }
        this.handleCapacityChange = this.handleCapacityChange.bind(this)
        this.handleCapacityUpdate = this.handleCapacityUpdate.bind(this)
    }

    /*
     * Callback function for when there is a change in capacity value
     */
    handleCapacityChange(event){
        this.setState({
            defaultCapacity: event.target.value,
            msg: ""
        })
    }

    /*
     * Callback function for when user clicks on "update" button to save new
     * capacity value on db
     */
    handleCapacityUpdate(){
        const { defaultCapacity } = this.state
        Firebase.database().ref("/settings/capacity").set(defaultCapacity)
            .then(() => {
                this.setState({
                    msg: { CAPACITY_UPDATED_SUCCESS }
                })
            })
            .catch((error) => {
                this.setState({
                    msg: { CAPACITY_UPDATED_SUCCESS }
                })
            })
    }

    render() {
        const { defaultCapacity, msg } = this.state
        const { handleCapacityChange, handleCapacityUpdate } = this
        return (
            <div>
                <div className="section-title">{ CAPACITY_TITLE }</div>
                <div className="admin-settings__capacity-block">
                    <div className="admin-settings__subtitle">
                        { CAPACITY_SUBTITLE }
                    </div>
                    <div className="admin-settings__capacity-input-block">
                        <input
                            type="number"
                            className="text-input"
                            value={ defaultCapacity }
                            onChange={ handleCapacityChange }
                        />
                    </div>
                </div>
                <div className="admin-settings__update-capacity-button-block">
                    <input
                        type="button"
                        className="button-add-reserve"
                        value={ UPDATE_BUTTON }
                        onClick={ handleCapacityUpdate }
                    />
                </div>
                {
                    msg.length > 0 ?
                    <div className="admin-setting__update-capacity-msg">
                        { msg }
                    </div> : <div></div>
                }
            </div>
        )
    }
}

export default AdminSettings
