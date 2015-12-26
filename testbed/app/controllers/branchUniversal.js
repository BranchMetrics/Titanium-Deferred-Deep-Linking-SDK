var branch = require('io.branch.sdk');
var branchUniversalObjectProxy;

/*
 ************************************************
 * Create custom loading indicator
 ************************************************
 */
var actInd;
var indView;
var indicatorShowing = false;

var USE_ALERT = true; // use alerts to show responses or print them otherwise

function showIndicator(title) {
    indicatorShowing = true;

    // black view
    indView = Titanium.UI.createView({
        height:50,
        width: 125,
        backgroundColor: '#000',
        borderRadius: 10,
        opacity: 0.7
    });

    var style;

    if (OS_IOS) {
        style = Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN;
    } else {
        style = Ti.UI.ActivityIndicatorStyle.DARK;
    }

    actInd = Titanium.UI.createActivityIndicator({
        style: style,
        font: {
            fontFamily: 'Helvetica Neue',
            fontSize: 15,
            fontWeight: 'bold'
        },
        color: 'white',
        message: title,
        width: 210
    });

    indView.add(actInd);
    $.window.add(indView);

    actInd.show();
}

function hideIndicator() {
    if(indicatorShowing == true) {
        if (actInd) {
            actInd.hide();
        }
        if(indView != null) {
            $.window.remove(indView);
            indView = null
        }
        indicatorShowing = false;
    }
}

/*
 ************************************************
 * Initializers
 ************************************************
 */
$.initialize = function(params) {
    $.initializeViews();
    $.initializeHandlers();
    $.window.open();
    $.toggleButtons(false);
};

$.initializeViews = function() {
    Ti.API.info("start initializeViews");
    $.linkTextArea.setEditable(false);
    $.linkTextArea.setValue("generated link here");
};

$.initializeHandlers = function() {
    $.initBranchButton.addEventListener('click', $.onInitBranchButtonClicked);
    $.registerViewButton.addEventListener('click', $.onRegisterViewButtonClicked);
    $.generateUrlButton.addEventListener('click', $.onGenerateUrlButtonClicked);
    $.shareSheetButton.addEventListener('click', $.onShareSheetButtonClicked);
    $.copyButton.addEventListener('click', $.onCopyButtonClicked);

    // Add global event handlers to hide/show custom indicator
    Titanium.App.addEventListener('show_indicator', function(e) {
        if(e.title == null) {
            e.title = 'Loading... ';
        }
        if(indicatorShowing == true) {
            hideIndicator();
        }
        showIndicator(e.title);
    });

    Titanium.App.addEventListener('hide_indicator', function(e) {
        hideIndicator();
    });
};

/*
 ************************************************
 * Event Handlers
 ************************************************
 */
$.onInitBranchButtonClicked = function() {
    Ti.API.info("inside onInitBranchButtonClicked");
    branchUniversalObjectProxy = branch.createBranchUniversalObject({
        "canonicalIdentifier" : "sample-id",
        "title" : "Sample",
        "contentDescription" : "This is a sample",
        "contentImageUrl" : "http://contentimageurl.com/media/1235904.jpg",
        "contentIndexingMode" : "private",
        "contentMetadata" : {
            "key" : "value",
            "key2" : "value2"
        },
    });

    // Branch Universal Object Listeners
    branchUniversalObjectProxy.addEventListener("bio:generateShortUrl", $.onGenerateUrlFinished);
    if (OS_ANDROID) {
        branchUniversalObjectProxy.addEventListener("bio:shareLinkDialogLaunched", $.onShareLinkDialogLaunched);
        branchUniversalObjectProxy.addEventListener("bio:shareLinkDialogDismissed", $.onShareLinkDialogDismissed);
        branchUniversalObjectProxy.addEventListener("bio:shareLinkResponse", $.onShareLinkResponse);
        branchUniversalObjectProxy.addEventListener("bio:shareChannelSelected", $.onShareChannelSelected);
    }

    $.toggleButtons(true);

    showData({"init BUO":"success"});
}

$.onRegisterViewButtonClicked = function() {
    Ti.API.info("inside onRegisterViewButtonClicked");
    branchUniversalObjectProxy.registerView();
    showData({"registerView":"success"});
}

$.onGenerateUrlButtonClicked = function() {
    Ti.API.info("inside onGenerateUrlButtonClicked");
    branchUniversalObjectProxy.generateShortUrl({
        "feature" : "sample-feature",
        "channel" : "sample-channel",
        "stage" : "sample-stage",
        "duration" : 1,
    }, {
        "$desktop_url" : "http://desktop_url.com",
    });
}

$.onGenerateUrlFinished = function(data) {
    Ti.API.info("inside onGenerateUrlFinished");
    Ti.API.info("GenerateUrlFinished: " + data["generatedLink"]);
    $.linkTextArea.setValue(data["generatedLink"]);
}

$.onShareSheetButtonClicked = function() {
    Ti.API.info("inside onShareSheetButtonClicked");
    branchUniversalObjectProxy.showShareSheet({
        "feature" : "share-feature",
        "channel" : "share-channel",
        "stage" : "share-stage",
        "duration" : 1,
    }, {
        "$desktop_url" : "http://desktop_url.com",
    });
}

$.onShareLinkDialogLaunched = function(data) {
    Ti.API.info("inside onShareLinkDialogLaunched");
}

$.onShareLinkDialogDismissed = function(data) {
    Ti.API.info("inside onShareLinkDialogDismissed");
}

$.onShareLinkResponse = function(data) {
    Ti.API.info("inside onShareLinkResponse");
}

$.onShareChannelSelected = function(data) {
    Ti.API.info("inside onShareChannelSelected");
}

$.onCopyButtonClicked = function() {
    Ti.API.info("inside onCopyButtonClicked");
    Ti.UI.Clipboard.clearText();
    Ti.UI.Clipboard.setText($.linkTextArea.getValue());
}

/*
 ************************************************
 * Methods
 ************************************************
 */
$.toggleButtons = function(enable) {
    $.registerViewButton.enabled = enable;
    $.generateUrlButton.enabled = enable;
    $.shareSheetButton.enabled = enable;
}

function showData(data) {
    Ti.API.info("start showData");

    if (USE_ALERT) {
        var dict = {};
        for (key in data) {
            if (key != "type" && key != "source" && key != "bubbles" && key != "cancelBubble") {
                dict[key] = data[key];
            }
        }

        if (OS_ANDROID) {
            alert(JSON.stringify(dict));
        } else if (OS_IOS){
            var dialog = Ti.UI.createAlertDialog({
                title  : "Result:",
                message: "" + JSON.stringify(dict),
                buttonNames: ["OK"],
            });
            dialog.show();
        }
    } else {
        for (key in data) {
            if ((key != "type" && key != "source" && key != "bubbles" && key != "cancelBubble") && data[key] != null) {
                Ti.API.info(key + data["key"]);
            }
        }
    }
}

$.initialize();
