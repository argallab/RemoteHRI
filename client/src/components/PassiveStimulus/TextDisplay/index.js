// Code developed by Finley Lau*, Deepak Gopinath*. Copyright (c) 2020. Argallab. (*) Equal contribution
import React from 'react';
import { Button } from 'react-bootstrap';
import LoadingScreen from '../../LoadingScreen';

export default class TextDisplay extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loaded: false,
            text: ""
        }

        this.onSubmit = this.onSubmit.bind(this)
    }

    componentDidMount() {
        var json = this.props.data
        this.setState({
            start: Date.now(),
            data: json,
            loaded: true,
            text: json.text
        })
    }

    onSubmit() {
        console.log("onSubmit called from TextDisplay")
        var answer = {
            start: this.state.start,
            end: Date.now()
        }
        this.props.submit(answer)
    }


    render() {
        if (this.state.loaded)
        {
            return (
                <div>
                    <div dangerouslySetInnerHTML={{ __html: this.state.text }}></div>
                    <div style={{marginTop: 10}} className="centered-content"><Button onClick={this.onSubmit}>Next</Button></div>
                </div>
            )
        } else {
            return (
                <LoadingScreen />
            )
        }

    }
}