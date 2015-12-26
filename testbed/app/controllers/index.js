var branch = require('io.branch.sdk');
branch.setDebug();

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
    $.window.open();

    $.initializeViews();
    $.initializeHandlers();

    Ti.API.info("start initSession");
    branch.setDebug(true);
    branch.getAutoInstance();
    Ti.App.fireEvent("show_indicator");
};

$.initializeViews = function() {
    Ti.API.info("start initializeViews");
};

$.initializeHandlers = function() {
    // Android Activity Listeners
    if (OS_ANDROID) {
        Ti.Android.currentActivity.addEventListener("open", function(e) {
            Ti.API.info("inside open");
        });

        Ti.Android.currentActivity.addEventListener("newintent", function(e) {
            Ti.API.info("inside newintent: " + e);
            $.window.open();
            branch.setDebug(true);
            branch.getAutoInstance();
            Ti.App.fireEvent("show_indicator");

        });
    }

    $.getSessionButton.addEventListener('click', $.onGetSessionButtonClicked);
    $.getInstallSessionButton.addEventListener('click', $.onGetInstallSessionButtonClicked);
    $.setIndentityButton.addEventListener('click', $.onSetIdentityButtonClicked);
    $.customActionButton.addEventListener('click', $.onCustomActionButtonClicked);
    $.rewardBalanceButton.addEventListener('click', $.onRewardBalanceButtonClicked);
    $.redeemRewardButton.addEventListener('click', $.onRedeemRewardButtonClicked);
    $.creditHistoryButton.addEventListener('click', $.onCreditHistoryButtonClicked);
    $.branchUniversalButton.addEventListener('click', $.onBranchUniversalButtonClicked);

    // Branch Listeners
    branch.addEventListener("bio:initSession", $.onInitSessionFinished);
    branch.addEventListener("bio:loadRewards", $.onLoadRewardFinished);
    branch.addEventListener("bio:getCreditHistory", $.onGetCreditHistoryFinished);
    branch.addEventListener("bio:redeemRewards", $.onRedeemRewardFinished);

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
$.onInitSessionFinished = function(data) {
    Ti.API.info("inside onInitSessionFinished");
    showData(data);
    Ti.App.fireEvent("hide_indicator");
}

$.onGetSessionButtonClicked = function() {
    Ti.API.info("inside onGetSessionButtonClicked");
    var sessionParams = branch.getLatestReferringParams();
    showData(sessionParams);
}

$.onGetInstallSessionButtonClicked = function() {
    Ti.API.info("inside onGetInstallSessionButtonClicked");
    var installParams = branch.getFirstReferringParams();
    showData(installParams);
}

$.onSetIdentityButtonClicked = function() {
    Ti.API.info("inside onSetIdentityButtonClicked");
    if (OS_ANDROID) {
        branch.setIdentity($.identityTextField.getValue());
        showData({"setIdentity":$.identityTextField.getValue()});
    } else if (OS_IOS) {
        branch.setIdentity($.identityTextField.getValue(), function(params, success){
            if (success) {
                alert("identity set: "+$.identityTextField.getValue());
            }
            else {
                alert("Set Identity FAILED");
            }
        });
    }
}

$.onCustomActionButtonClicked = function() {
    Ti.API.info("inside onCustomActionButtonClicked");
    branch.userCompletedAction($.customActionTextField.getValue());
    showData({"userCompletedAction":$.customActionTextField.getValue()});
}

$.onBranchUniversalButtonClicked = function() {
    Ti.API.info("inside onBranchUniversalButtonClicked");
    var branchUniversalWin = Alloy.createController('branchUniversal', {});
    view = branchUniversalWin.getView();
    view.open();
}

$.onRewardBalanceButtonClicked = function() {
    Ti.API.info("inside onRewardBalanceButtonClicked");
    branch.loadRewards();
}

$.onLoadRewardFinished = function(data) {
    Ti.API.info("inside onLoadRewardFinished");
    showData(data);
}

$.onRedeemRewardButtonClicked = function() {
    Ti.API.info("inside onRedeemRewardButtonClicked");
    branch.redeemRewards(5);
    showData({"redeemRewards":5});
}

$.onCreditHistoryButtonClicked = function() {
    Ti.API.info("inside onCreditHistoryButtonClicked");
    branch.getCreditHistory();
}

$.onGetCreditHistoryFinished = function(data) {
    Ti.API.info("inside onGetCreditHistoryFinished");
    showData(data);
}

$.onRedeemRewardFinished = function(data) {
    Ti.API.info("redeem reward finished");
    showData(data);
}

/*
 ************************************************
 * Methods
 ************************************************
 */

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
