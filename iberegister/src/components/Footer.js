import React, { Component } from 'react'

import {FOOTER_PHONE} from "../constants"

class FooterBar extends Component {
    render() {
        return (
            <div class="bottomnav">
              <div class="footer-text">Información de contacto</div>
              <div class="footer-text">Tel: {FOOTER_PHONE}</div>
            </div>
        )
    }
}

export default FooterBar