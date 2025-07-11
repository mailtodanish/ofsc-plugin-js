/**
 * [MOHD AHSHAN DANISH][23 December 2024]
 * OFSC Plugin JavaScript
 *
 * This script defines a plugin for the Oracle Field Service Cloud (OFSC) application.
 * It initializes the plugin, handles messages, and populates discrepancy reason attributes.
 *
 * Functions:
 * - init: Initializes the plugin and sets up the message listener.
 * - getOrigin: Extracts the origin from a given URL.
 * - getMetaAttributes: Parses and populates discrepancy reason attributes from provided data.
 * - generateCallId: Generates a unique call ID.
 * - searchPart: Searches for parts catalog structures.
 * - countrylist: Fetches and populates the country list.
 * - open: Initializes the plugin UI.
 * - sendPostMessageData: Sends data to the parent window.
 * - _messageListener: Handles messages from the parent window.
 * @version 0.1.0
 * @since 0.1.0
 * @param {void}
 * @returns {void}
 * @throws {Error} - If there is an error
 *
 */

"use strict";
(function () {
  window.OfscPlugin = function () {
    this.jwtCallerId = "";
    this.jwtToken;
    this.geolocationCoordinates = "";
    this.init = function (pluginName) {
      this.tag = pluginName;
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

    // Sample code for populating dropdwon using Metadata
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

    this.getGeoLocation = function () {
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const crd = pos.coords;
            console.error("Coordinates>>", crd.latitude + "," + crd.longitude);

            resolve(crd.latitude + "," + crd.longitude);
          },
          (error) => {
            console.error("Error", error);
            reject(error);
          }
        );
      });
    };

    this.open = function (data) {
      let activity = data.activity;
      let securedData = data.securedData;

      const submit = document.getElementById("SubmitBtnId");
      if (!!submit) {
        submit.addEventListener("click", async () => {
          this.geolocationCoordinates = await this.getGeoLocation();
          alert("Exact Location>>" + this.geolocationCoordinates);
          this.sendPostMessageData({
            apiVersion: 1,
            method: "close",
            activity: {
              aid: data.activity.aid,
              XP_LOCATION_CRD: this.geolocationCoordinates,
            },
          });
        });
      }

      // cancel Button
      const CancelBtnId = document.getElementById("CancelBtnId");
      if (!!CancelBtnId) {
        CancelBtnId.addEventListener("click", () => {
          this.sendPostMessageData({
            apiVersion: 1,
            method: "close",
          });
        });
      }

      // Open --end
    };

    this.getLoginDetails = function () {
      let url = "/rest/ofscCore/v1/users/admin?fields=login";
      fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.jwtToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.error("User Details>>", data);
        });
    };

    this.sendPostMessageData = function (data) {
      console.error(`${this.tag} Sent>>`, JSON.stringify(data, undefined, "\t"));
      parent.postMessage(JSON.stringify(data), this.getOrigin(document.referrer));
    };
    this.generateCallId = function () {
      return btoa(String.fromCharCode.apply(null, window.crypto.getRandomValues(new Uint8Array(16))));
    };

    this.getJWTTokens = function () {
      //{
      // "KEY": {
      // "type": "ofs",
      // "resourceUrl": "https://*** */.test.fs.ocs.oraclecloud.com"
      // }
      // }}
      let jwtToken = window.localStorage.getItem(`${this.tag}_applictaion`);
      if (jwtToken) {
        jwtToken = JSON.parse(jwtToken);
        this.jwtCallerId = this.generateCallId();
        for (let key in jwtToken) {
          let value = jwtToken[key];
          if (value.type === "ofs") {
            this.sendPostMessageData({
              apiVersion: 1,
              method: "callProcedure",
              callId: this.jwtCallerId,
              procedure: "getAccessToken",
              params: {
                applicationKey: key,
              },
            });
          }
        }
      }
    };

    // Data recieved from OFSC to Plugin
    this._messageListener = function (event) {
      const data = JSON.parse(event.data);
      console.error(`${this.tag} Received>>`, JSON.stringify(data, undefined, "\t"));
      switch (data.method) {
        case "init":
          window.localStorage.setItem(`${this.tag}_applictaion`, JSON.stringify(data.applications));
          this.sendPostMessageData({
            apiVersion: 1,
            method: "initEnd",
          });
          break;
        case "open":
          this.getJWTTokens();
          this.open(data);
          break;
        case "callProcedureResult":
          let callId = data.callId;
          if (callId === this.jwtCallerId) {
            this.jwtToken = data.resultData.token;
            console.error("JWT Token>>", this.jwtToken);
          }
          break;
        case "updateResult":
          break;
        case "error":
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
    plugin.init("Demo Plugin");
  });
})();
