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