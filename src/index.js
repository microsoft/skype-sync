// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class Sync {

  constructor() {
    window.addEventListener("message", this.handleMessages);
  }

  initHandler;
  receiveHandler;
  persistedContentHandler;

  handleMessages = (window, messageEvent) => {
    const data = JSON.parse(messageEvent.data);
    switch (data.type) {
      case "__SKYPE__LOAD_PERSISTED_CONTENT":
        this.persistedContentHandler(data.payload);
        return;
      case "__SKYPE__INIT":
        this.initHandler(data.payload);
        return;
      default:
        this.receiveHandler(type, data.payload);
        return;
    }
  }

  init = (handler) => {
    this.initHandler = handler;
  }

  onReceive = (handler) => {
    this.receiveHandler = handler;
  }

  onPersistedContentLoaded = (handler) => {
    this.persistedContentHandler = handler
  }

  send = (type, payload) => {
    parent.postMessage(
      JSON.stringify({
        type: type,
        payload: payload
      }),
      "*"
    );
  }

  persistContent = (content) => {
    this.send("__SKYPE__PERSIST_CONTENT", content);
  }

  loadPersistedContent = () => {
    this.send("__SKYPE__LOAD_PERSISTED_CONTENT");
  }
}

const sync = new Sync();
export default sync;
