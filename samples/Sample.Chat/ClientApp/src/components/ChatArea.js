import React, { Component } from 'react';

export default class ChatArea extends Component {
    render() {
        return (
            <div>
                {this.props.messages.map(message => { return this.renderMessage(message); })}
            </div>
        );
    }

    renderMessage(message) {
        return (
            <div key={message.timestamp} className='panel panel-primary'>
                <div className='panel-heading'>
                    { new Date(message.timestamp).toLocaleTimeString() }
                </div>
                <div className='panel-body'>
                    {message.data}
                </div>
            </div>
        );
    }
}
