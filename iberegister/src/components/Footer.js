import React, { Component } from 'react'

import {FOOTER_PHONE} from "../constants"

class FooterBar extends Component {
    render() {
        return (
            <div className="bottomnav">
              <div className="footer-text">Información de contacto</div>
              <div className="footer-text">Tel: {FOOTER_PHONE}</div>
            </div>
        )
    }
}

export default FooterBar