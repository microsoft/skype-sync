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

const INIT_MESSAGE_NAME = 'skype-sync_initmessage';

export class Sync {
    private initHandler: (payload: InitMessageData, cuid: string, asid: string) => void;
    private persistedContentHandler: (payload: string) => void;
    private receiveHandler: (type: string, uid: string, payload?: string) => void;
    private errorHandler: (code: ErrorCodes) => void;

    private asid: string;
    private cuid: string;
    private addinIdentifier: string;

    private conversationId: string;
    private interviewCode: string;
    private userId: string;
    private configuration: ConfigurationValue[];
    private setting: ConfigurationValue[];

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

        this.communication.sendMessage(message);
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
        this.communication.storeContext(context);
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

        const initMessage: InitMessageRequest = {
            type: INIT_MESSAGE_NAME,
            addinIdentifier: this.addinIdentifier
        };

        window.parent.postMessage(
            JSON.stringify(initMessage),
            '*.skype.com'
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

        const data: InitMessageResponse = JSON.parse(messageEvent.data);
        if (!data || data.type !== INIT_MESSAGE_NAME) {
            return;
        }

        window.removeEventListener('message', this.handleHostMessage);
        this.interviewCode = data.interviewId;
        this.userId = data.userId;
        this.conversationId = data.conversationId;
        this.configuration = data.configuration;
        this.setting = data.setting;

        this.communication.connect(data.syncurl)
            .then(() => {
                this.sendInitMessage();
            })
            .catch(() => {
                if (this.initReject) {
                    this.initReject();
                }

                this.initResolve = undefined;
                this.initReject = undefined;
            });
    }

    private sendInitMessage = () => {
        const request: InitializeRequest = {
            AddinIdentifier: this.addinIdentifier,
            InterviewCode: this.interviewCode,
            UserId: this.userId,
            ThreadId: this.conversationId
        };
        this.communication.sendInitRequest(request);
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

interface InitMessageRequest {
    type: string;
    addinIdentifier: string;
}

interface InitMessageResponse {
    type: string;
    conversationId?: string;
    interviewId: string;
    userId: string;
    syncurl: string;
    configuration: ConfigurationValue[];
    setting: ConfigurationValue[];
}

interface ConfigurationValue {
    name: string;
    value: string;
}

export default new Sync();
