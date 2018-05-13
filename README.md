# Skype Sync SDK

Skype Sync allows you create shared experiences across different Skype Interviews instances.

It is a very simple SDK providing essentially two functions:
1. Mesaging between the addins instances
2. Session context managment 

## Getting started

Let's assume we are building a simplified synchronized note pad app.

1. Import the Sync SDK
```js
import Sync from 'skype-sync'
```

2. Make sure to setup initialization handlers to accomondate for your UI.
```js
Sync.initHandler = (context: InitContext) => {
  // initialize your application with given configuration
})
```

more info: [InitContext](https://github.com/Microsoft/skype-sync/blob/418f9406e8a048b8ab8f335639445206bff7868c/src/models.ts#L46)


## Broadcast actions

Most of the addins are collaborative so in order to send out a message to other meeting participants using the addin,simply call the send message `sendMessage(type:string, payload?:any)` to broadcast the message.

```js
Sync.sendMessage('ADD_NOTE', {
  message: textInput.value,
  author: this.state.author
})
```

## Receive actions

To handle incoming messages the app needs to register message event handler to which the sent messages of other participants will be sent.
load of the action.

```js
Sync.messageHandler((message: Message) => {
  switch (message.type) {
    case 'ADD_NOTE':
      // handle adding new note
      addNote(message.payload)
      break
    case 'DELETE_NOTE':
      // handle deleting a note
      deleteNote(message.payload)
      break
    default:
      return
  }
})
```

more info: [Message](https://github.com/Microsoft/skype-sync/blob/418f9406e8a048b8ab8f335639445206bff7868c/src/models.ts#L30)


## Persist content

Skype Interviews offers turn key long-term storage for your addin content to have it persist across multiple sessions. Users who close their browser and come back to the session in a few days will be able to pick up the session from where they left off. 
For example, the diagrem you made using SKype Interviews Whiteboard will be shown every time you or recruiter open the interview link. 

### Persist your content across sessions
Put in any javascript object and we're going to persist it for this session as JSON serialized string.
```js
Sync.persistContent(context)
```

### Load persisted content
To retrieve the previously persisted content, simply call the `fetchContent():Promise<string>` method to initiate a request to fetch the stored content. This
```js
Sync.fetchContent()
    .then(content) => {
      app.state.notes = content
    })
```

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
