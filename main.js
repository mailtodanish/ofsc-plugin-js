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
      // Implement PluginUI
      const aid = document.getElementById("aid");
      aid.innerHTML = "Activity Id: " + data.activity.aid;

      const astatus = document.getElementById("astatus");
      astatus.innerHTML = "Activity Status: " + data.activity.astatus;

      const travel_time = document.getElementById("travel_time");
      if (travel_time !== null) {
        travel_time.value = data.activity?.travel.toString() || "";
      }

      const position_in_route = document.getElementById("position_in_route");
      position_in_route.innerHTML = "Activity travel: " + data.activity.position_in_route;

      const closeButton = document.getElementById("dismiss_button");
      closeButton.addEventListener(
        "click",
        function () {
          this.sendPostMessageData({
            apiVersion: 1,
            method: "close",
          });
        }.bind(this)
      );

      const updateButton = document.getElementById("submit_button");
      updateButton.addEventListener(
        "click",
        function () {
          this.sendPostMessageData({
            apiVersion: 1,
            method: "update",
            activity: {
              travel: travel_time.value,
            },
          });
        }.bind(this)
      );
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
        case "updateResult":
          console.error("UpdateResult method called");
          break;
        case "error":
          console.error("Error method called");
          console.error(data.errors);
          confirm(JSON.stringify(data.errors));
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
