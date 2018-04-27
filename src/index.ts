// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import AddinsHub, { MessageRequest, StoreContextRequest } from './synchronization/skypeHub';
import {HostMessage, AddinInitHostMessage}  from './hostMessage';

const INIT_MESSAGE_NAME = 'skype-sync-init';

export class Sync {

    private errorHandler: (code: ErrorCodes) => void;

    private host: string;
    private addinToken: string;
    private configuration: ConfigurationValue[];
    private setting: ConfigurationValue[];

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
    public onReceive(handler: (message: MessageRequest) => void) {
        this.addinsHub.messageReceivedListener = handler;
    }

    /**
     * An event handler which will be invoked when there is 
     * 
     * @param {(payload: string) => void} handler 
     * @memberof Sync
     */
    public onContentLoaded(handler: (payload: string) => void) {
        this.addinsHub.contextFetchedListener = handler;
    }

    public onError(handler: (code: ErrorCodes) => void) {
        this.errorHandler = handler;
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

        const message: MessageRequest = {
            Type: type,
        };

        if (payload) {
            message.Payload = JSON.stringify(payload);
        }

        this.addinsHub.sendMessage(message);
    }

    public persistContent(content: any) {

        const context: StoreContextRequest = {
            Payload: JSON.stringify(content),
        };
        this.addinsHub.storeContext(context);
    }

    public fetchContent() {
        this.addinsHub.fetchContext();
    }

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        if (!messageEvent ||messageEvent.source === window || !messageEvent.data || !messageEvent.origin || !messageEvent.origin.endsWith('.skype.com')) {
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
        this.configuration = data.configuration;
        this.setting = data.setting;
        this.host = data.addinApiHost;

        var addinUrl = `${data.addinApiHost}/hubs/addins?token=${data.addinToken}`;
        this.addinsHub.connect(addinUrl);
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

export default new Sync();
