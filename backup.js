// Ready ->init ->initEnd->remove
"use strict";
(function () {
  window.OfscPlugin = function () {};
  window.OfscPlugin.prototype.getOrigin = function (url) {
    if (url != "") {
      if (url.indexOf("://") > -1) {
        return "https://" + url.split("/")[2];
      } else {
        return "https://" + url.split("/")[0];
      }
    }
    return "";
  };
  window.OfscPlugin.prototype.sendPostMessageData = function (data) {
    parent.postMessage(JSON.stringify(data), this.getOrigin(document.referrer));
  };
  window.OfscPlugin.prototype.init = function (messageListener) {
    console.error(this);
    window.addEventListener("message", this._messageListener.bind(this), false);
    console.error("Init method called");

    this.sendPostMessageData({
      apiVersion: 1,
      method: "ready",
      sendInitData: true,
      showHeader: true,
      enableBackButton: true,
    });
  };
  window.OfscPlugin.prototype._messageListener = function (event) {
    console.error(event);
    switch (event.data.type) {
      case "init":
        console.log("Init method called");
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
})();
