// Ready ->init ->initEnd->remove
// TODO : Create a custome field : XA_DISCREPANCY_REASON as ENU in OFSC

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

    this.getMetaAttributes = function (data) {
      if (data) {
        const json = JSON.parse(data);
        this.XA_DISCREPANCY_REASON_ATTRIBUTES = json["XA_DISCREPANCY_REASON_ATTRIBUTES"]["enum"];

        const reason_code = document.getElementById("reason_code");
        for (const [key, value] of Object.entries(this.XA_DISCREPANCY_REASON_ATTRIBUTES)) {
          const option = document.createElement("option");
          option.value = key;
          option.text = value.text;
          reason_code.appendChild(option);
        }
      }
    };

    this.generateCallId = function () {
      return btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(16))));
    };

    this.searchPart = function () {
      this.sendPostMessageData({
        apiVersion: 1,
        callId: this.generateCallId(),
        method: "callProcedure",
        procedure: "getPartsCatalogsStructure",
      });
    };

    // External API in plugin
    this.countrylist = function (url, userId, passworf) {
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          const country = document.getElementById("country");
          for (const [key, value] of Object.entries(data)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = value.name.official;
            country.appendChild(option);
          }
        });
    };

    this.open = function (data) {
      // getMetadata of properties
      this.getMetaAttributes(localStorage.getItem("simplePlugin"));

      this.secureData = data.securedData;

      // this.countrylist(this.secureData.countryListAPI, this.secureData.userId, this.secureData.password);

      // Implement PluginUI
      const aid = document.getElementById("aid");
      aid.innerHTML = "Activity Id: " + data.activity.aid;

      const astatus = document.getElementById("astatus");
      astatus.innerHTML = "Activity Status: " + data.activity.astatus;

      const reason_code = document.getElementById("reason_code");

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

      const search_parts = document.getElementById("search_parts");
      search_parts.addEventListener(
        "click",
        function () {
          this.searchPart();
        }.bind(this)
      );

      const updateButton = document.getElementById("update_activity");
      updateButton.addEventListener(
        "click",
        function () {
          this.sendPostMessageData({
            apiVersion: 1,
            method: "update",
            activity: {
              aid: data.activity.aid,
              XA_DISCREPANCY_REASON: reason_code.value,
            },
          });
        }.bind(this)
      );

      const closeUpdate = document.getElementById("close_update");
      closeUpdate.addEventListener(
        "click",
        function () {
          this.sendPostMessageData({
            apiVersion: 1,
            method: "close",
            activity: {
              aid: data.activity.aid,
              XA_DISCREPANCY_REASON: reason_code.value,
            },
          });
        }.bind(this)
      );
    };

    this.sendPostMessageData = function (data) {
      console.error("Sent>>", JSON.stringify(data, undefined, "\t"));
      parent.postMessage(JSON.stringify(data), this.getOrigin(document.referrer));
    };
    this._messageListener = function (event) {
      const data = JSON.parse(event.data);
      console.error("Received>>", JSON.stringify(data, undefined, "\t"));
      switch (data.method) {
        case "init":
          console.error("Init method called");
          localStorage.setItem("simplePlugin", JSON.stringify(data.attributeDescription));
          this.sendPostMessageData({
            apiVersion: 1,
            method: "initEnd",
          });
          break;
        case "open":
          console.error("Open method called");
          this.open(data);
          break;
        case "callProcedureResult":
          console.error("callProcedureResult received");
          break;
        case "updateResult":
          console.error("UpdateResult method called");
          break;
        case "error":
          console.error("Error method called");
          confirm(JSON.stringify(data.error));
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
