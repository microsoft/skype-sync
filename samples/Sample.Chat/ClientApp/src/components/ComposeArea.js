import React, { Component } from 'react';

export default class ComposeArea extends Component {
    constructor() {
        super();

        this.state = {
            text: ''
        }
    }

    render() {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className='form-group'>
                    <input
                        className='form-control'
                        type='text'
                        value={this.state.text}
                        placeholder='Enter message'
                        onChange={this.updateText.bind(this)}
                    />
                </div>
                <div className='form-group'>
                    <input
                        className='btn btn-lg btn-default'
                        type='button'
                        onClick={this.sendMessage.bind(this)}
                        value='Send'
                    />
                </div>
            </div>
        );
    }

    updateText(event) {
        this.setState({
            text: event.target.value
        });
    }

    sendMessage() {
        if (!this.state.text) {
            return;
        }

        this.props.sendMessage(this.state.text);
        this.setState({
            text: ''
        });
    }
}
