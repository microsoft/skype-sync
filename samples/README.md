# Skype Sync SDK - Samples

Samples provides overview on the Skype Sync SDK features.

## Prerequisities

- Visual Studio 2017 (or similar on your Operating System)
- Latest .NET Core SDK - https://www.microsoft.com/net/download

In order to have samples fully working, you need to start SignalR server that complies with the Skype Sync SDK. We are providing such server in `/server` folder. It provides simplified functionality of real Skype Signaling Service.

1. Open `/server/csharp/devhub.sln`
2. Build the solution - _Build/Build Solution_ (first time might be slower as you will fetch all required nuget packages)
3. Run the server - _Debug/Start Debugging_
4. After application is started, browser shall be opened. Copy the url.

## Basic Sample - Chat

Simple chat application using the synchronization between clients is available in `samples` folder. It is using ASP.NET Core as host application and Javascript with React on the frontend. In order to have this sample fully working you need to have running sample Skype Signaling server - described in _Prerequisities_.

1. Navigate to `samples` folder.
2. Open `Samples.sln` solution file with Visual Studio.
3. In Visual Studio open file `ClientApp/src/App.js`.
4. On line 7 change value of `HUB_URL` to the value you got in _Prerequisities step 4_. So the line will look similar to:

```js
const HUB_URL = 'http://localhost:3036';
```
5. You are now good to go - build solution (_Build/Build Solution_) and run the app (_Debug/Start Debugging_)

### Chat sample description

```js
    componentDidMount() {
        // register the init handler - called when Skype Sync SDK is ready
        Sync.initHandler = (context) => {
            // inform React application that we are fully loaded
            this.setState({
                loaded: true
            });
            // initiate the connection to Skype Signaling service
            Sync.connect().then(() => {
                // inform React application that Skype Signaling service is connected
                // it will cause React application to display chat input field and
                // it also renders the chat log
                this.setState({
                    connected: true
                });
            });
        };

        // register the messange handler - it is called when other participants
        // of the session sends message
        Sync.messageHandler = (message) => {
            switch (message.type) {
                // message with type ADD_MESSAGE is received
                case 'ADD_MESSAGE':
                    const messages = this.state.messages;
                    // read data from message and store it to application state
                    messages.push(JSON.parse(message.payload));
                    this.setState({
                        messages
                    });
                    break;
                default:
                    console.log(`Unknown message type: ${message.type}`);
                    break;
            }
        };

        // In order to have Skype Sync working locally we have created __devInit function.
        // It will just call initHandler and you can control the payload returned - for example
        // you can change the settings.
        Sync.___devInit(asid, { apiHost: HUB_URL });
    }

    // function is called when user clicks the SEND button
    sendMessage(text) {
        // create payload that will be send to other participants of the session
        const message = { data: text, timestamp: Date.now() };
        // send the message using Skype Signaling Service
        Sync.sendMessage('ADD_MESSAGE', message);

        // store same message to local state as Skype Signaling service is not
        // sending messages back to caller
        const messages = this.state.messages;
        messages.push(message);
        this.setState({
            messages
        });
    }
```
