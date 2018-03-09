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

class Sync {

    private initHandler: (cuid: string, asid: string, payload: InitMessageData) => void;
    private persistedContentHandler: (payload: string) => void;
    private receiveHandler: (type: string, payload: string, uid: string, asid: string) => void;

    private cuid: string;
    private asid: string;

    constructor() {
        window.addEventListener("message", this.handleMessages);
    }

    public init(handler: (cuid: string, asid: string, payload: InitMessageData) => void) {
        this.initHandler = handler;
    }

    public onReceive(handler: (type: string, payload: string, uid: string, asid: string) => void) {
        this.receiveHandler = handler;
    }

    public onPersistedContentLoaded(handler: (payload: string) => void) {
        this.persistedContentHandler = handler
    }

    public persistContent(content: any) {
        this.send("__SKYPE__PERSIST_CONTENT", content);
    }

    public loadPersistedContent() {
        this.send("__SKYPE__LOAD_PERSISTED_CONTENT");
    }

    private handleMessages = (messageEvent) => {
        if (!messageEvent || messageEvent.source === window || !messageEvent.data) {
            return;
        }
        const data: MessagePayload = JSON.parse(messageEvent.data);
        switch (data.type) {
            case "__SKYPE__LOAD_PERSISTED_CONTENT":
                if (this.persistedContentHandler) {
                    this.persistedContentHandler(data.payload);
                }
                return;
            case "__SKYPE__INIT":
                this.asid = data.asid;
                this.cuid = data.uid;
                if (this.initHandler) {
                    this.initHandler(data.uid, data.asid, JSON.parse(data.payload));
                }
                return;
            default:
                if (this.receiveHandler) {
                    this.receiveHandler(data.type, data.payload, data.uid, data.asid);
                }
                return;
        }
    }

    private send(type: string, payload?: any) {
        window.parent.postMessage(
            JSON.stringify({
                type: type,
                payload: payload,
                uid: this.cuid,
                asid: this.asid
            }),
            "*"
        );
    }
}

interface MessagePayload {
    type: string;
    payload: string;
    uid: string;
    asid: string;
}

export default new Sync();
