// Ready ->init ->initEnd->remove
"use strict";
(function () {
  window.OfscPlugin = function () {
    this.init = function (messageListener) {
      window.addEventListener("message", this._messageListener.bind(this), false);
      this.sendPostMessageData({
        apiVersion: 1,
        method: "ready",
        sendInitData: true,
        showHeader: true,
        enableBackButton: true,
      });
    };
    this.getOrigin = function (url) {
      if (url != "") {
        if (url.indexOf("://") > -1) {
          return "https://" + url.split("/")[2];
        } else {
          return "https://" + url.split("/")[0];
        }
      }
      return "";
    };

    this.sendPostMessageData = function (data) {
      console.error("Sent>>", data);
      parent.postMessage(JSON.stringify(data), this.getOrigin(document.referrer));
    };
    this._messageListener = function (event) {
      const data = JSON.parse(event.data);
      console.error("Received>>", data);
      switch (data.method) {
        case "init":
          console.error("Init method called");
          this.sendPostMessageData({
            apiVersion: 1,
            method: "initEnd",
          });
          break;
        case "open":
          console.error("Open method called");
          break;
        case "error":
          console.error("Open method called");
          break;
        case "close":
          this.sendPostMessageData({
            apiVersion: 1,
            method: "close",
          });
          break;
      }
    };
  };

  window.addEventListener("load", function () {
    console.error("Plugin is loading");
    const plugin = new OfscPlugin();
    plugin.init();
  });
})();
