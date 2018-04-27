// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import signalr = require('@aspnet/signalr');

export default class AddinsHub {

    public messageReceivedListener: (message: MessageRequest) => void;
    public contextFetchedListener: (context: string) => void;

    private hub: signalr.HubConnection;

    constructor() {

        // default NOP listeners
        this.messageReceivedListener = (message: MessageRequest) => {
            console.log('[AddinsHub]::NOP-:message received:', message);
        }
        
        this.contextFetchedListener = (context: string) => {
            console.log('[AddinsHub]::NOP-context received:', context);
        }
    }

    public connect(url: string): Promise<void> {

        this.hub = new signalr.HubConnection(url);

        this.hub.on('messageReceived', this.messageReceivedListener);
        this.hub.on('contextFetched', this.contextFetchedListener);

        return this.hub.start();
    }

    public sendMessage(message: MessageRequest): Promise<void> {
        return this.hub.invoke('sendMessage', message);
    }

    public storeContext(context: StoreContextRequest): Promise<void> {
        return this.hub.invoke('storeContext', context);
    }

    public fetchContext(): Promise<void> {
        return this.hub.invoke('fetchContext');
    }
}

export interface MessageRequest {
    type: string;
    payload?: string;
}

export interface StoreContextRequest {
    payload: string;
}