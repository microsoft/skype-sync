// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import SkypeHub, { MessageRequest, StoreContextRequest, GetContextRequest, InitializeRequest } from './synchronization/skypeHub';

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

// TODO: how do we get url? - hardcoding
const HUB_URL = 'https://rome-hub-int.azurewebsites.net/hubs/addins';

export class Sync {
    private initHandler: (payload: InitMessageData, cuid: string, asid: string) => void;
    private persistedContentHandler: (payload: string) => void;
    private receiveHandler: (type: string, uid: string, payload?: string) => void;
    private errorHandler: (code: ErrorCodes) => void;

    private asid: string;
    private cuid: string;
    private addinIdentifier: string;
    private interviewCode: string;
    private userId: number;
    private userType: number;

    private connected = false;
    private communication: SkypeHub;

    private initResolve?: () => void;
    private initReject?: () => void;

    constructor() {
        this.communication = new SkypeHub();
    }

    public init(addinIdentifier: string): Promise<void> {
        this.communication.readyListeneres.push(this.handleReadyEvent);
        this.communication.messageReceivedListeneres.push(this.handleMessageEvent);
        this.communication.contextLoadedListeneres.push(this.handleContextLoadedEvent);

        this.addinIdentifier = addinIdentifier;
        return new Promise<void>((resolve, reject) => {
            this.initResolve = resolve;
            this.initReject = reject;

            this.requestIdentifiers();
            this.communication.connect(HUB_URL)
                .then(() => {
                    if (this.interviewCode) {
                        this.sendInitMessage();
                    }
                    this.connected = true;
                })
                .catch(() => {
                    reject();

                    this.initResolve = undefined;
                    this.initReject = undefined;
                });
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
            addinIdentifier: this.addinIdentifier,
            asid: this.asid,
            payload,
            type,
            uid: this.cuid
        };
        this.communication.sendMessage(message);
    }

    public persistContent(content: any) {
        if (!this.isCommunicationEstablished()) {
            return;
        }

        const context: StoreContextRequest = {
            addinIdentifier: this.addinIdentifier,
            asid: this.asid,
            interviewCode: this.interviewCode,
            payload: JSON.stringify(content),
            uid: this.cuid
        };
        this.communication.storeContext(context);
    }

    public loadPersistedContent() {
        if (!this.isCommunicationEstablished()) {
            return;
        }

        const request: GetContextRequest = {
            addinIdentifier: this.addinIdentifier,
            asid: this.asid,
            interviewCode: this.interviewCode
        };
        this.communication.getContext(request);
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
        window.addEventListener('message', this.handleHostMessage);

        window.parent.postMessage(
            JSON.stringify({
                bridgeRequestType: 'bridge/getconversationinfo',
                forceRequestUserConsent: false,
                shouldSetNamespace: false
            }),
            '*'
        );

        setTimeout(() => {
            if (this.initReject) {
                this.initReject();
                this.initResolve = undefined;
                this.initReject = undefined;
            }
        }, 10000);
    }

    private handleHostMessage = (messageEvent: MessageEvent) => {
        if (!messageEvent ||
            messageEvent.source === window ||
            !messageEvent.data) {
            return;
        }

        // TODO: check if we have message we are looking for

        const data: MessagePayload = JSON.parse(messageEvent.data);
        this.interviewCode = data.interviewId;
        this.userId = data.userId;
        this.userType = data.userType;
        window.removeEventListener('message', this.handleHostMessage);

        if (this.connected) {
            this.sendInitMessage();
        }
    }

    // TODO: how to get userId
    private sendInitMessage = () => {
        const request: InitializeRequest = {
            addinIdentifier: this.addinIdentifier,
            interviewCode: this.interviewCode,
            userId: this.userId,
            userType: this.userType
        };
        this.communication.sendInitRequest(request);
    }

    private handleReadyEvent = (asid: string, cuid: string) => {
        this.asid = asid;
        this.cuid = cuid;

        if (this.initHandler) {
            this.initHandler({
                // TODO: how do we pass in configuration and settings
                configuration: [],
                settings: []
            }, cuid, asid);
        }

        if (this.initResolve) {
            this.initResolve();
        }
    }

    private handleMessageEvent = (message: MessageRequest) => {
        if (this.receiveHandler) {
            this.receiveHandler(
                message.type,
                message.uid,
                message.payload
            );
        }
    }

    private handleContextLoadedEvent = (payload: string) => {
        if (this.persistedContentHandler) {
            this.persistedContentHandler(payload);
        }
    }
}

interface MessagePayload {
    type: string;
    interviewId: string;
    userId: number;
    userType: number;
}

export default new Sync();
