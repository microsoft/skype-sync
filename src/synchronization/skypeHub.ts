import signalr = require('@aspnet/signalr');

export default class AddinsHub {
    public readyListeneres: Array<(asid: string, cuid: string) => void> = [];
    public messageReceivedListeneres: Array<(message: MessageRequest) => void> = [];
    public contextLoadedListeneres: Array<(context: string) => void> = [];

    private hub: signalr.HubConnection;

    public connect(url: string): Promise<void> {
        this.hub = new signalr.HubConnection(url);

        this.hub.on('readyAddins', this.handleReadyEvent);
        this.hub.on('routeMessage', this.handleMessageEvent);
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
    InterviewCode?: string;
    ThreadId?: string;
    AddinIdentifier: string;
    UserId: string;
}

export interface MessageRequest {
    Type: string;
    AddinIdentifier: string;
    Asid: string;
    Uid: string;
    Payload?: string;
}

export interface StoreContextRequest {
    InterviewCode: string;

    AddinIdentifier: string;
    Asid: string;
    Uid: string;
    Payload: string;
}

export interface GetContextRequest {
    InterviewCode: string;

    AddinIdentifier: string;
    Asid: string;
}
