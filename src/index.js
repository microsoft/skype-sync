// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

class Sync {

  constructor() {
    this.handleMessages = this.handleMessages.bind(this)
    this.init = this.init.bind(this)
    this.onReceive = this.onReceive.bind(this)
    this.onPersistedContentLoaded = this.onPersistedContentLoaded.bind(this)
    this.send = this.send.bind(this)
    this.persistContent = this.persistContent.bind(this)
    this.loadPersistedContent = this.loadPersistedContent.bind(this)
    window.addEventListener("message", this.handleMessages);
  }

  handleMessages(messageEvent) {
    if (!messageEvent || !messageEvent.data) {
      return;
    }
    const data = JSON.parse(messageEvent.data);
    switch (data.type) {
      case "__SKYPE__LOAD_PERSISTED_CONTENT":
        if (this.persistedContentHandler) {
          this.persistedContentHandler(data.payload);
        }
        return;
      case "__SKYPE__INIT":
        if (this.initHandler) {
          this.initHandler(data.payload);
        }
        return;
      default:
        if (this.receiveHandler) {
          this.receiveHandler(data.type, data.payload);
        }
        return;
    }
  }

  init(handler) {
    this.initHandler = handler;
  }

  onReceive(handler) {
    this.receiveHandler = handler;
  }

  onPersistedContentLoaded(handler) {
    this.persistedContentHandler = handler
  }

  send(type, payload) {
    parent.postMessage(
      JSON.stringify({
        type: type,
        payload: payload
      }),
      "*"
    );
  }

  persistContent(content) {
    this.send("__SKYPE__PERSIST_CONTENT", content);
  }

  loadPersistedContent() {
    this.send("__SKYPE__LOAD_PERSISTED_CONTENT");
  }
}

const sync = new Sync();
export default sync;
