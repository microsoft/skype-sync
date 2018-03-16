// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

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
    TooManyRequests = 1
}

const INIT_MESSAGE_TYPE = "__SKYPE__INIT";
const ERROR_MESSAGE_TYPE = "__SKYPE__ERROR";
const LOAD_CONTENT_MESSAGE_TYPE = "__SKYPE__LOAD_PERSISTED_CONTENT";
const CONTENT_MESSAGE_TYPE = "__SKYPE__PERSIST_CONTENT";

export class Sync {

    private initHandler: (payload: InitMessageData, cuid: string, asid: string) => void;
    private persistedContentHandler: (payload: string) => void;
    private receiveHandler: (type: string, payload: string, uid: string, asid: string) => void;
    private errorHandler: (code: ErrorCodes) => void;

    private cuid: string;
    private asid: string;

    private origin: string;

    constructor() {
        window.addEventListener("message", this.handleMessages);
    }

    public init(handler: (payload: InitMessageData, cuid: string, asid: string) => void) {
        this.initHandler = handler;
    }

    public onReceive(handler: (type: string, payload: string, uid: string, asid: string) => void) {
        this.receiveHandler = handler;
    }

    public onPersistedContentLoaded(handler: (payload: string) => void) {
        this.persistedContentHandler = handler
    }

    public onError(handler: (code: ErrorCodes) => void) {
        this.errorHandler = handler;
    }

    public send(type: string, payload?: any) {
        if (!this.origin) {
            throw new Error("SDK was not initialized.");
        }

        window.parent.postMessage(
            JSON.stringify({
                type: type,
                payload: payload,
                uid: this.cuid,
                asid: this.asid
            }),
            this.origin
        );
    }

    public persistContent(content: any) {
        this.send(CONTENT_MESSAGE_TYPE, content);
    }

    public loadPersistedContent() {
        this.send(LOAD_CONTENT_MESSAGE_TYPE);
    }

    private handleMessages = (messageEvent: MessageEvent) => {
        if (!messageEvent ||
            messageEvent.source === window ||
            !messageEvent.data) {
            return;
        }

        const data: MessagePayload = JSON.parse(messageEvent.data);
        if (!this.origin && data.type === INIT_MESSAGE_TYPE) {
            this.origin = messageEvent.origin;
        }

        if (this.origin !== messageEvent.origin) {
            return;
        }

        switch (data.type) {
            case LOAD_CONTENT_MESSAGE_TYPE:
                if (this.persistedContentHandler) {
                    this.persistedContentHandler(data.payload);
                }
                return;
            case INIT_MESSAGE_TYPE:
                this.asid = data.asid;
                this.cuid = data.uid;
                if (this.initHandler) {
                    this.initHandler(JSON.parse(data.payload), this.asid, this.cuid);
                }
                return;
            case ERROR_MESSAGE_TYPE:
                if (this.errorHandler) {
                    this.errorHandler(JSON.parse(data.payload));
                } else {
                    throw new Error("No error handler is available.");
                }
                return;
            default:
                if (this.receiveHandler) {
                    this.receiveHandler(data.type, data.payload, data.uid, data.asid);
                }
                return;
        }
    }
}

interface MessagePayload {
    type: string;
    payload: string;
    uid: string;
    asid: string;
}

export default new Sync();
