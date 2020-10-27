import React, { Component } from 'react'

import HeaderBar from '../components/HeaderBar'
import RegisterForm from '../components/RegisterForm'


class Home extends Component {
    render() {
        return (
            <div class="main">
                <div className='header-layout'></div>
                <HeaderBar></HeaderBar>
                <RegisterForm/>
            </div>
        )
    }
}

export default Home