import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';
import GridSE2Mode from '../components/GridSE2Mode'
import GridMode from '../components/GridMode'

export default class MultipleGridWorlds extends Component{
    constructor(props) {
        super(props)

        
    }
    componentDidMount() {
        var json = this.props.data

        this.numGridWorlds = json.numGridWorlds //N gridworld support
        
    }
}