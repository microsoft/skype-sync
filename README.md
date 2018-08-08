# Skype Sync SDK

Skype Sync allows you create shared experiences across different Skype Interviews instances. You can use Skype Sync to synchronize experience between sessions.

## Getting started

Let's assume we are building a simplified synchronized note pad app.

1. Install skype-sync npm package.
```
npm install skype-sync
```

2. Import the Sync SDK
```ts
import Sync, { InitContext } from 'skype-sync';
```

3. Make sure to setup initialization handlers to accomondate for your UI.
```ts
Sync.initHandler = this.syncSdkReady.bind(this);
```

4. Implement the initialization handler. It will be called when Skype Sync is ready to be used, it will also contain Initialization Context.

```ts
private syncSdkReady(context: InitContext) {
  // implement your application start-up logic        
}
```

## InitContext
InitContext contains data that can be used by your application to target specific interview or user.

```ts
// Unique addin session shared by all the users.
addinSessionId: string;

// Unique has of a user identifier he has in a given addin session.
addinSessionUserId: string;

// Interview session under which addins are executing.
sessionId: string;

// Authorization token which is sent to the addin API.
token: string;

// User's language used in the session.
language: string;

// An array of addin configuration values (optional).
configuration?: ConfigurationValue[];
```

## Broadcast actions

When our notepad wants to send out new actions to the other instances, the app needs to explicitly connect to the signaling service. 

```ts
Sync.connect().then(() => {
  // you are now connected and you can send messages
});
```

After that your application can just call `Sync.sendMessage(type: string, payload?: any);` to broadcast its information. 
- `type` can be any string, identifying the type of your message in the application, so in our case of note pad it can be 'ADD_NOTE'.
- `payload` is optional parameter and can be any payload that is sent to the other participants that are sharing same `addinSessionId` (~all participants using same addin in same interview session).

```js
Sync.sendMessage('ADD_NOTE', {
  note: textInput.value
});
```

### NOTE
There are certain limits on how many messages can be sent in time and what can be overal size of the messages:
- only 50 messages can be sent every 200ms
- total amount of data that can be sent every 200ms cannot be higher than 128Kb

In case that the limit is reached and next message is sent we are informing aplication using the `errorHandler` (please see below);

## Receive actions

To handle incoming messages the app needs to register the message handler.

```ts
import Sync, { Message } from 'skype-sync';

Sync.messageHandler = (messageRequest: Message) => {
  // handle incoming message
}
```

## Errors handling

In order to allow applications to react on the errors that can happen during synchronization or when the message limit is reached, the app can subscribe to error handler:

```ts
Sync.errorHandler = (e: any) => {
  // handle Skype Sync error
}
```

Application can also be subscribed to the changes of the Signaling service connection state. Please note that Skype Sync can send messages only when the connection state is `Connected`.

```ts
Sync.connectionHandler = (newState: ConnectionState) => {
  // handle connection state
}
```

Connection state can be one of those values:
- `Undefined` - Unknown state, typically when Skype Sync is not initialized
- `Connecting` - Application is connecting to the Signaling service
- `Connected` - Application is connected to the Signaling service
- `Disconnected` - Application is not connected to the Signaling service

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
