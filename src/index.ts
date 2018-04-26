// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import AddinsHub, { MessageRequest, StoreContextRequest, GetContextRequest, InitializeRequest } from './synchronization/skypeHub';

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

const INIT_MESSAGE_NAME = 'skype-sync-init';

export class Sync {

    private initHandler: (payload: InitMessageData, cuid: string, asid: string) => void;
    private persistedContentHandler: (payload: string) => void;
    private receiveHandler: (type: string, uid: string, payload?: string) => void;
    private errorHandler: (code: ErrorCodes) => void;

    private addinIdentifier: string;
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

    private onHostMessageReceived = (messageEvent: MessageEvent) => {
        if (!messageEvent ||messageEvent.source === window || !messageEvent.data || !messageEvent.origin || !messageEvent.origin.endsWith('.skype.com')) {
            return;
        }

        const hostMessage: HostMessage = JSON.parse(messageEvent.data);
        switch (hostMessage.type) {
            case INIT_MESSAGE_NAME:
                // host requested init;
                this.initializeAddin(<AddinInitHostMessage>hostMessage);
                break;
            default:
                console.error("unknown host message of type:" + hostMessage.type);

        }
    }

    private initializeAddin(data: AddinInitHostMessage) 
    {
        this.addinIdentifier = data.manifestIdentifier;
        this.configuration = data.configuration;
        this.setting = data.setting;

        var addinUrl = `${data.addinApiHost}/hubs/addins`;
        
        this.addinsHub.connect(addinUrl)
            .then(() => {
                // addin connected - telemetry?
            })
            .catch((e) => {
                // addin connected failure - telemetry/toast?
            });
    }




    












    /**
     * 
     * 
     * @param {string} addinIdentifier 
     * @param {any} [string=host] Origin of the target to which messages will be posted (eg. https://interviews.skype.com)
     * @returns {Promise<void>} 
     * @memberof Sync
     */
    public init(addinIdentifier: string, host: string): Promise<void> {
        
        this.addinIdentifier = addinIdentifier;
        this.host = host;
        
        this.addinsHub.readyListeneres.push(this.handleReadyEvent);
        this.addinsHub.messageReceivedListeneres.push(this.handleMessageEvent);
        this.addinsHub.contextLoadedListeneres.push(this.handleContextLoadedEvent);

        return new Promise<void>((resolve, reject) => {
            this.initResolve = resolve;
            this.initReject = reject;

            this.requestIdentifiers();

            setTimeout(() => {
                if (this.initReject) {
                    reject();
                    this.initResolve = undefined;
                    this.initReject = undefined;
                }
            }, 120000);
        });
    }

    public onInit(handler: (payload: InitMessageData, cuid: string, asid: string) => void) {
        this.initHandler = handler;
    }

    public onReceive(handler: (type: string, uid: string, payload?: string) => void) {
        this.receiveHandler = handler;
    }

    public onPersistedContentLoaded(handler: (payload: string) => void) {
        this.persistedContentHandler = handler;
    }

    public onError(handler: (code: ErrorCodes) => void) {
        this.errorHandler = handler;
    }

    public sendMessage(type: string, payload?: any) {
        if (!this.isCommunicationEstablished()) {
            return;
        }

        const message: MessageRequest = {
            AddinIdentifier: this.addinIdentifier,
            Asid: this.asid,
            Type: type,
            Uid: this.cuid
        };

        if (payload) {
            message.Payload = JSON.stringify(payload);
        }

        this.addinsHub.sendMessage(message);
    }

    public persistContent(content: any) {
        if (!this.isCommunicationEstablished()) {
            return;
        }

        const context: StoreContextRequest = {
            AddinIdentifier: this.addinIdentifier,
            Asid: this.asid,
            InterviewCode: this.interviewCode,
            Payload: JSON.stringify(content),
            Uid: this.cuid
        };
        this.addinsHub.storeContext(context);
    }

    public loadPersistedContent() {
        if (!this.isCommunicationEstablished()) {
            return;
        }

        const request: GetContextRequest = {
            AddinIdentifier: this.addinIdentifier,
            Asid: this.asid,
            InterviewCode: this.interviewCode
        };
        this.addinsHub.getContext(request);
    }

    private isCommunicationEstablished() {
        if (!this.asid || !(this.interviewCode)) {
            if (this.errorHandler) {
                this.errorHandler(ErrorCodes.NotInitialized);
                return false;
            }

            throw new Error('Cannot send messages when communication channel is not established.');
        }

        return true;
    }

    private requestIdentifiers() {

        const initMessage: InitMessageRequest = {
            type: INIT_MESSAGE_NAME,
            addinIdentifier: this.addinIdentifier
        };
        window.parent.postMessage(
            JSON.stringify(initMessage),
            this.host
        );
    }


    private sendInitMessage = () => {
        const request: InitializeRequest = {
            AddinIdentifier: this.addinIdentifier,
            InterviewCode: this.interviewCode,
            UserId: this.userId,
            ThreadId: this.conversationId
        };
        this.addinsHub.sendInitRequest(request);
    }

    private handleReadyEvent = (asid: string, cuid: string) => {
        this.asid = asid;
        this.cuid = cuid;

        if (this.initHandler) {
            this.initHandler({
                configuration: this.configuration,
                settings: this.setting
            }, cuid, asid);
        }

        if (this.initResolve) {
            this.initResolve();
        }

        this.initReject = undefined;
        this.initResolve = undefined;
    }

    private handleMessageEvent = (message: MessageRequest) => {
        if (this.receiveHandler) {
            this.receiveHandler(
                message.Type,
                message.Uid,
                message.Payload
            );
        }
    }

    private handleContextLoadedEvent = (payload: string) => {
        if (this.persistedContentHandler) {
            this.persistedContentHandler(payload);
        }
    }
}

/**
 * Set of attributes every host message has
 * 
 * @interface HostMessage
 */
interface HostMessage {
    /**
     * Type of message host is sending
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    type: string;
    
    /**
     * Unique string identifier of the addin
     * 
     * @type {string}
     * @memberof HostMessage
     */
    manifestIdentifier: string;
}

/**
 * Definition of the specific attributes of the event host 
 * is sending to addins when requesting them to initialize 
 * to ready state.
 * 
 * @interface AddinInitHostMessage
 * @extends {HostMessage}
 */
interface AddinInitHostMessage extends HostMessage {
    /**
     * Url of the addins api host
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinApiHost: string;
    
    /**
     * 
     * Token which addin will send as bearer authorization header in 
     * order to authorize itself.
     * 
     * @type {string}
     * @memberof AddinInitHostMessage
     */
    addinToken: string;

    /**
     * A set of configuration properties which are to be 
     * defined per interview/meeting during the meeting creation.
     * 
     * @type {ConfigurationValue[]}
     * @memberof AddinInitHostMessage
     */
    configuration: ConfigurationValue[];

    /**
     * Set of settings which company/tenant admin sets up  on a company level
     * and which are used for every interview/meeting
     * 
     * @type {ConfigurationValue[]}
     * @memberof AddinInitHostMessage
     */
    setting: ConfigurationValue[];
}



interface ConfigurationValue {
    name: string;
    value: string;
}

export default new Sync();
