import React, { Component } from 'react';
import Sync from '@skype/skype-sync';

import ChatArea from './components/ChatArea';
import ComposeArea from './components/ComposeArea';

const HUB_URL = '<REPLACE_THIS_WITH_YOUR_URL>';

export default class App extends Component {
    constructor() {
        super();

        this.state = {
            loaded: false,
            connected: false,
            messages: []
        };
    }

    render() {
        return (
            <div>
                <h1>Sample Chat</h1>
                {!this.state.loaded && <p>Loading</p>}
                {this.state.loaded && this.renderContent()}
            </div>
        );
    }

    renderContent() {
        if (!this.state.connected) {
            return <p>Connecting...</p>;
        }

        return (
            <div style={{ margin: '20px' }}>
                <ChatArea messages={this.state.messages} />
                <ComposeArea sendMessage={this.sendMessage.bind(this)} />
            </div>);
    }

    componentDidMount() {
        const asid = `test-notepad-${new Date(Date.now()).getMonth()}-${new Date(Date.now()).getDate()}`;
        Sync.initHandler = () => {
            this.setState({
                loaded: true
            });
            Sync.connect().then(() => {
                this.setState({
                    connected: true
                });
            });
        };
        Sync.messageHandler = (message) => {
            switch (message.type) {
                case 'ADD_MESSAGE':
                    const messages = this.state.messages;
                    messages.push(JSON.parse(message.payload));
                    this.setState({
                        messages
                    });
                    break;
                default:
                    console.log(`Unknown message type: ${message.type}`);
                    break;
            }
        };
        Sync.___devInit(asid, { apiHost: HUB_URL });
    }

    sendMessage(text) {
        const message = { data: text, timestamp: Date.now() };
        Sync.sendMessage('ADD_MESSAGE', message);

        const messages = this.state.messages;
        messages.push(message);
        this.setState({
            messages
        });
    }
}
