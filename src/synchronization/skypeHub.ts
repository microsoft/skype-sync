// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import signalr = require('@aspnet/signalr');
import { Message, StoreContext } from '../models';

export class AddinsHub {

    public messageReceivedListener: (message: Message) => void;
    public contextFetchedListener: (context: string) => void;

    private hub: signalr.HubConnection;

    constructor() {

        // default NOP listeners
        this.messageReceivedListener = (message: Message) => {
            console.log('[AddinsHub]::NOP-:message received:', message);
        }
        
        this.contextFetchedListener = (context: string) => {
            console.log('[AddinsHub]::NOP-context received:', context);
        }
    }

    public connect(url: string): Promise<void> {

        this.hub = new signalr.HubConnection(url, );

        this.hub.on('messageReceived', this.messageReceivedListener);
        this.hub.on('contextFetched', this.contextFetchedListener);

        return this.hub.start()
        .then(() => {
            
        })
        .catch(e => {
            console.error(e);
            throw e;
        })
    }

    public sendMessage(message: Message): Promise<void> {
        return this.hub.invoke('sendMessage', message);
    }

    public storeContext(context: StoreContext): Promise<void> {
        return this.hub.invoke('storeContext', context);
    }

    public fetchContext(): Promise<void> {
        return this.hub.invoke('fetchContext');
    }
}
