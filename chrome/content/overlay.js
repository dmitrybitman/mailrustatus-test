var mailrustatus = {
  onLoad: function() {
    this.strings = document.getElementById("mailrustatus-strings");
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.mailrustatus.");
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

    this.sessionKey = "676a879745a92458acff7178eebd0177";
    this.uid = "17594233803478387194";

    this.addAuthFrameEvent();

    // if (bar = document.getElementById('urlbar')) {
    //   this.watchAddressBar(bar);
    // }
    // if (bar = document.getElementById('urlbar-edit')) {
    //   this.watchAddressBar(bar);
    // }
  },

  watchAddressBar: function(addressBar) {
    // Save the old ontextentered function so that we don't lose functionality
    addressBar.oldOnTextEntered = addressBar.onTextEntered;
  
    addressBar.onTextEntered = function () {
      // Application.console.log(this.value);
      if (this.value == "тест") {
        mailrustatus.makeRequest(mailrustatus.makeParams('stream.post', {'user_text': 'тест'}));
      }
      return this.oldOnTextEntered();
    };

      
    // // Check for the Go button
    // var goButtons = [ document.getElementById("go-button"), document.getElementById("tool-go") ];
    
    // for (var i = 0; i < goButtons.length; i++) {
    //   var goButton = goButtons[i];
      
    //   if (goButton){
    //     // Add the correction when the Go button is used
    //     if (typeof BrowserUI != 'undefined' && goButton.getAttribute("command")) {
    //       goButton.setAttribute("other_command",goButton.getAttribute("command"));
    //       goButton.removeAttribute("command");
    //       goButton.setAttribute("oncommand", "if (document.getElementById('"+addressBar.id+"').onTextEntered(true)) { BrowserUI.doCommand(this.getAttribute('other_command')); }");
          
    //     }
    //     else if (goButton.getAttribute("oncommand")) {
    //       goButton.setAttribute("oncommand", "if (document.getElementById('"+addressBar.id+"').onTextEntered(true)) { " + goButton.getAttribute("oncommand") + "}");
    //     }
    //     else if (goButton.getAttribute("onclick")) {
    //       goButton.setAttribute("onclick", "if (document.getElementById('"+addressBar.id+"').onTextEntered(true)) { " + goButton.getAttribute("onclick") + "}");
    //     }
    //     else {
    //       goButton.setAttribute("oncommand", "if (!document.getElementById('"+addressBar.id+"').onTextEntered(true)) { event.stopPropagation(); event.preventDefault(); return false; }");
    //     }
    //   }
    // }
  },

  makeRequest: function(params) {
    var formData = new FormData();
    for (property in params) {
      if (params.hasOwnProperty(property)) {
        formData.append(property, params[property]);
      }
    }

    var req = new XMLHttpRequest();
    req.open("POST", this.prefs.getCharPref('apiBaseUrl'), true);
    // req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    // req.setRequestHeader("Content-Length", argString.length);
    
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        console.log(JSON.parse(req.responseText));
      }
    };
    
    req.send(formData);
  },


  makeParams: function(method, extraParams) {
    var params = {
      'method': method,
      'app_id': this.getAppId(),
      'session_key': this.sessionKey,
      'format': 'json',
    };
    for (var property in extraParams) {
      if (extraParams.hasOwnProperty(property) && !params.hasOwnProperty(property)) {
        params[property] = extraParams[property];
      }
    }
    var keys = [];
    for (var property in params) {
      if (params.hasOwnProperty(property)) {
        keys.push(property);
      }
    }
    keys.sort();

    var sig = '';
    for (i = 0; i < keys.length; i++) {
      sig += keys[i] + '=' + params[keys[i]];
    }

    params['sig'] = hex_md5('' + this.uid + sig + this.prefs.getCharPref('privateKey'));
    return params;
  },

  getAppId: function() {
    return this.prefs.getCharPref('appId')
  },

  // checkLoginStatus: function() {
  //   if (mailRuAuthWindow.closed) {
  //       var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
  //              .getInterface(Components.interfaces.nsIWebNavigation)
  //              .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
  //              .rootTreeItem
  //              .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
  //              .getInterface(Components.interfaces.nsIDOMWindow);
  //       mainWindow.document.getElementById('mailrustatus-panel').openPopup(mainWindow.document.getElementById('mailrustatus-toolbar-button'),'after_end');
  //       // rebuildCurrentView();
  //   }
  //   else {
  //       setTimeout(function(){checkLoginStatus()}, 1000);
  //   }
  // }

  onAuthPageLoaded: function(event) {
    event.originalTarget;
  },

  openAuthWindow: function(event) {

      // var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      //            .getInterface(Components.interfaces.nsIWebNavigation)
      //            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
      //            .rootTreeItem
      //            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      //            .getInterface(Components.interfaces.nsIDOMWindow);
      // mainWindow.document.getElementById('mailrustatus-panel').hidePopup();

      var authUrl = 'https://connect.mail.ru/oauth/authorize?client_id='+this.getAppId()+'&scope=stream&response_type=token&display=popup';
      mailRuAuthWindow = window.openDialog(authUrl, 'MailRuAuthWindow', 'width=600,height=400,toolbar=0,modal=yes,alwaysRaised=yes,scrollbars=0,status=0,resizable=0,location=1,menuBar=0,chrome=0');
      mailRuAuthWindow.addEventListener('load', function() { this.onAuthPageLoaded(); }, false);
      mailRuAuthWindow.focus();
      // setTimeout(function(){LJwidgetCheckLoginStatus()}, 2000);
  },

  addAuthFrameEvent: function() {
      var frame = document.getElementById('mailrustatus-frame');
      frame.contentDocument.getElementById('auth').addEventListener('click', $.proxy(this.openAuthWindow, this), true);
  }

};

window.addEventListener("load", function() { mailrustatus.onLoad(); }, false);
