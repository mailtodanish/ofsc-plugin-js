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
    this.open = function (data) {
      console.error("Activity Data", data.activity.aid);
      const aid = document.getElementById("aid");
      aid.innerHTML = "Activity ID: " + data.activity.aid;

      const status = document.getElementById("status");
      status.innerHTML = "Status: " + data.activity.astatus;

      const travel = document.getElementById("travel");
      travel.innerHTML = "  Travel: " + data.activity.travel;

      const position_in_route = document.getElementById("position_in_route");
      position_in_route.innerHTML = "  Position in route: " + data.activity.position_in_route;

      const closeButton = document.getElementById("close");
      closeButton.onclick = () => {
        this.sendPostMessageData({
          apiVersion: 1,
          method: "close",
        });
      };
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
          this.open(data);
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
