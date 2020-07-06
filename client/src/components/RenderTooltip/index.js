import React, {Component} from 'react';
import {Tooltip} from 'react-bootstrap'

export default class RenderTooltip extends Component {
    render()
    {
        return (
            <Tooltip id="button-tooltip" {...this.props}>
                {this.props.tooltipText}
            </Tooltip>
        )
    }
}