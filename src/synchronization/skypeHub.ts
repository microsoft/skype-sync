import { HubConnection } from '@aspnet/signalr';

export default class SkypeHub {
    public readyListeneres: Array<(asid: string, cuid: string) => void> = [];
    public messageReceivedListeneres: Array<(message: MessageRequest) => void> = [];
    public contextLoadedListeneres: Array<(context: string) => void> = [];

    private hub: HubConnection;

    public connect(url: string): Promise<void> {
        this.hub = new HubConnection(url);

        this.hub.on('readyAddins', this.handleReadyEvent);
        this.hub.on('sendAddinMessage', this.handleMessageEvent);
        this.hub.on('addinContextLoaded', this.handleContextLoadedEvent);

        return this.hub.start();
    }

    public sendInitRequest(request: InitializeRequest): Promise<void> {
        return this.hub.invoke('initializeAddins', request);
    }

    public sendMessage(message: MessageRequest): Promise<void> {
        return this.hub.invoke('sendAddinMessage', message);
    }

    public storeContext(context: StoreContextRequest): Promise<void> {
        return this.hub.invoke('storeAddinContext', context);
    }

    public getContext(request: GetContextRequest): Promise<void> {
        return this.hub.invoke('getAddinContext', request);
    }

    private handleReadyEvent = (asid: string, cuid: string) => {
        this.readyListeneres.forEach(listener => {
            listener(asid, cuid);
        });
    }

    private handleMessageEvent = (message: MessageRequest) => {
        this.messageReceivedListeneres.forEach(listener => {
            listener(message);
        });
    }

    private handleContextLoadedEvent = (context: string) => {
        this.contextLoadedListeneres.forEach(listener => {
            listener(context);
        });
    }
}

export interface InitializeRequest {
    interviewCode: string;
    addinIdentifier: string;
    userId: number;
    userType: number;
}

export interface MessageRequest {
    type: string;
    addinIdentifier: string;
    asid: string;
    uid: string;
    payload?: string;
}

export interface StoreContextRequest {
    interviewCode: string;

    addinIdentifier: string;
    asid: string;
    uid: string;
    payload: string;
}

export interface GetContextRequest {
    interviewCode: string;

    addinIdentifier: string;
    asid: string;
}
