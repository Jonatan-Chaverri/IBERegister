import React, { Component } from 'react'

import {FOOTER_PHONE} from "../strings"


class FooterBar extends Component {
    render() {
        return (
            <div className="footer">
              <div className="footer__text">Información de contacto</div>
              <div className="footer__text">Tel: {FOOTER_PHONE}</div>
            </div>
        )
    }
}

export default FooterBar
