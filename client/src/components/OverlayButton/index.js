// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
import React from 'react'
import { OverlayTrigger, Button } from 'react-bootstrap'
import RenderTooltip from '../RenderTooltip'


export default class OverlayButtonTest extends React.Component {
    render() {
        const ol = this.props.disabled ? (<RenderTooltip tooltipText={this.props.tip} />) : <div></div>;


        var xs = this.props.disabled ? { pointerEvents: 'none' } : {};

        return (
            <div style={{ float: 'left' }}>
                <OverlayTrigger rootClose overlay={ol}>
                    <div style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                        <Button style={xs} disabled={this.props.disabled} onClick={this.props.onClickHandler}>
                            {this.props.text}
                        </Button>
                    </div>
                </OverlayTrigger>
            </div>
        );
    }
} 