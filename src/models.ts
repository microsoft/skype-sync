export interface ConfigurationItem {
    name: string;
    question: string;
    answerType: PredefinedAnsferType;
    answerOptions: string;
    required: boolean;
    defaultValue: string;
}

export enum PredefinedAnsferType {
    Undefiend = 0,
    Text = 1,
    Boolean = 2,
    Option = 3
}

export interface InitMessageData {
    configuration: Array<ConfigurationItem>;
    settings: Array<ConfigurationItem>;
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