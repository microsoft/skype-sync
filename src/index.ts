// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {AddinsHub}  from './synchronization/skypeHub';
import {HostMessage, AddinInitHostMessage}  from './hostMessage';

const INIT_MESSAGE_NAME = 'skype-sync-init';

export class Sync {

    private errorHandler: (code: ErrorCodes) => void;
    private initHandler: (context: InitContext) => void

    private host: string;
    private addinContext: InitContext;

    private addinsHub: AddinsHub;

    private initResolve?: () => void;
    private initReject?: () => void;

    constructor() {
        this.addinsHub = new AddinsHub();

        window.addEventListener('message', this.onHostMessageReceived);
    }

    /**
     * An event handler which will be invoked when there is a new message pushed from server to the addin
     * 
     * @param {(type: string, uid: string, payload?: string) => void} handler 
     * @memberof Sync
     */
    public onReceive(handler: (message: Message) => void) {
        this.addinsHub.messageReceivedListener = handler;
    }

    /**
     * An event handler which will be invoked when the addin context is restored
     * from the persistence store
     * 
     * @param {(payload: string) => void} handler 
     * @memberof Sync
     */
    public onContextLoaded(handler: (payload: string) => void) {
        this.addinsHub.contextFetchedListener = handler;
    }

    public onError(handler: (code: ErrorCodes) => void) {
        this.errorHandler = handler;
    }

    /**
     * Provides a way for addin to be informed once the sync sdk is initialized.
     * 
     * @param {(configuration: ConfigurationValue[], settings: ConfigurationValue[]) => void} handler 
     * @memberof Sync
     */
    public onInit(handler: (context: InitContext) => void) {
        this.initHandler = handler;
    }

    /**
     * Send a message through the host to other participants 
     * using addin at the same time
     * 
     * @param {string} type 
     * @param {*} [payload] 
     * @memberof Sync
     */
    public sendMessage(type: string, payload?: any) {
        const message: Message = {
            type: type,
        };

        if (payload) {
            message.payload = JSON.stringify(payload);
        }

        this.addinsHub.sendMessage(message);
    }

    public persistContent(content: any) {

        const context: StoreContext = {
            payload: JSON.stringify(content),
        };
        this.addinsHub.storeContext(context);
    }

    public fetchContent() {
        this.addinsHub.fetchContext();
    }

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        
        if (!messageEvent ||messageEvent.source === window || !messageEvent.data) {
            return;
        }

        const hostMessage: HostMessage = JSON.parse(messageEvent.data);
        switch (hostMessage.type) {
            case INIT_MESSAGE_NAME:
                // host requested init;
                this.onHostRequestedInit(<AddinInitHostMessage>hostMessage);
                break;
            default:
                console.error("Unknown host message of type:" + hostMessage.type);
        }
    }

    private onHostRequestedInit(data: AddinInitHostMessage) 
    {
        this.host = data.addinApiHost;

        var addinUrl = `${data.addinApiHost}/hubs/addins?token=${data.addinToken}`;
        this.addinsHub.connect(addinUrl)
            .then(() => {
                console.log('[SkypeSync]::onHostRequestedInit-connected', addinUrl);
                var context: InitContext = {
                    addinSessionId: data.addinSessionId,
                    addinSessionUserId: data.addinSessionUserId,
                    configuration: data.configuration,
                    sessionId: data.sessionId,
                    settings: data.setting,
                    token: data.addinToken,
                };
                this.initHandler(context);
            })
    }
}

export interface ConfigItem {
    name: string;
    value: string;
}

export interface InitMessageData {
    configuration: Array<ConfigItem>;
    settings: Array<ConfigItem>;
}

export enum ErrorCodes {
    Undefined = 0,
    NotInitialized = 1
}

export interface ConfigurationValue {
    name: string;
    value: string;
}


export interface Message {
    type: string;
    payload?: string;
}

export interface StoreContext {
    payload: string;
}

export interface InitContext {
    addinSessionId: string;
    addinSessionUserId: string;
    configuration: ConfigurationValue[];
    sessionId: string;
    settings: ConfigurationValue[];
    token: string;
}

export default new Sync();
