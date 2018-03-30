var branch = require('io.branch.sdk');
var USE_ALERT = true; // use alerts to show responses or print them otherwise

/*
 ************************************************
 * Initializers
 ************************************************
 */
$.initialize = function(params) {
    $.initializeViews();
    $.initializeHandlers();

    if (OS_IOS) {

        $.window.open();

        Ti.API.info("start initSession");

        branch.setUseTestBranchKey(true);
        branch.setDebug();
        branch.initSession();

    } else if (OS_ANDROID){

        $.window.open();

        branch.setDebug();

        Ti.Android.currentActivity.setOnStart(function(e){
            Ti.API.info('onStart' + JSON.stringify(e));
            branch.initSession();
        });

        Ti.Android.currentActivity.addEventListener("newintent", function(e) {
            Ti.API.info("inside newintent: " + JSON.stringify(e));
            branch.updateIntent(e.intent);

        });
    }
};

$.initializeViews = function() {
    Ti.API.info("start initializeViews");
    Ti.API.info(Ti.Filesystem.externalStorageDirectory);
    Ti.API.info(Ti.Filesystem.applicationCacheDirectory);

    Titanium.UI.setBackgroundColor('green');
};

$.initializeHandlers = function() {
    if (OS_IOS) {

        Ti.App.iOS.addEventListener('continueactivity', function(e) {
            Ti.API.info(e.activityType);
            Ti.API.info("inside continueactivity: " + JSON.stringify(e));

        });


    }

    $.getSessionButton.addEventListener('click', $.onGetSessionButtonClicked);
    $.getInstallSessionButton.addEventListener('click', $.onGetInstallSessionButtonClicked);
    $.setIdentityButton.addEventListener('click', $.onSetIdentityButtonClicked);
    $.customActionButton.addEventListener('click', $.onCustomActionButtonClicked);
    $.rewardBalanceButton.addEventListener('click', $.onRewardBalanceButtonClicked);
    $.redeemRewardButton.addEventListener('click', $.onRedeemRewardButtonClicked);
    $.creditHistoryButton.addEventListener('click', $.onCreditHistoryButtonClicked);
    $.branchUniversalButton.addEventListener('click', $.onBranchUniversalButtonClicked);
    $.logoutButton.addEventListener('click', $.onLogoutButtonClicked);

    // Branch Listeners
    branch.addEventListener("bio:initSession", $.onInitSessionFinished);
    branch.addEventListener("bio:logout", $.onLogoutFinished);
    branch.addEventListener("bio:loadRewards", $.onLoadRewardFinished);
    branch.addEventListener("bio:getCreditHistory", $.onGetCreditHistoryFinished);
    branch.addEventListener("bio:redeemRewards", $.onRedeemRewardFinished);
};

/*
 ************************************************
 * Event Handlers
 ************************************************
 */
$.onInitSessionFinished = function(data) {
    Ti.API.info("inside onInitSessionFinished");
    showData(data);
    alert(data);
};

$.onLogoutFinished = function() {
    Ti.API.info("inside onLogoutFinished");
    alert("Logout Success!");
};

$.onGetSessionButtonClicked = function() {
    Ti.API.info("inside onGetSessionButtonClicked");
    var sessionParams = branch.getLatestReferringParams();
    showData(sessionParams);
};

$.onGetInstallSessionButtonClicked = function() {
    Ti.API.info("inside onGetInstallSessionButtonClicked");
    var installParams = branch.getFirstReferringParams();
    showData(installParams);
};

$.onSetIdentityButtonClicked = function() {
    Ti.API.info("inside onSetIdentityButtonClicked");
    if (OS_ANDROID) {
        branch.setIdentity($.identityTextField.getValue());
        showData({"setIdentity":$.identityTextField.getValue()});
    } else if (OS_IOS) {
        branch.setIdentity($.identityTextField.getValue(), function(params, success){
            if (success) {
                alert("identity set: " + $.identityTextField.getValue());
            }
            else {
                alert("Set Identity FAILED");
            }
        });
    }
};

$.onCustomActionButtonClicked = function() {
    Ti.API.info("inside onCustomActionButtonClicked");
    branch.userCompletedAction($.customActionTextField.getValue());
    showData({"userCompletedAction":$.customActionTextField.getValue()});
};

$.onBranchUniversalButtonClicked = function() {
    Ti.API.info("inside onBranchUniversalButtonClicked");
    var branchUniversalWin = Alloy.createController('branchUniversal', {});
    view = branchUniversalWin.getView();
    view.open();
};

$.onLogoutButtonClicked = function() {
    Ti.API.info("inside onLogoutButtonClicked");
    branch.logout();
};

$.onRewardBalanceButtonClicked = function() {
    Ti.API.info("inside onRewardBalanceButtonClicked");
    branch.loadRewards();
};

$.onLoadRewardFinished = function(data) {
    Ti.API.info("inside onLoadRewardFinished");
    showData(data);
};

$.onRedeemRewardButtonClicked = function() {
    Ti.API.info("inside onRedeemRewardButtonClicked");
    branch.redeemRewards(5);
    showData({"redeemRewards":5});
};

$.onCreditHistoryButtonClicked = function() {
    Ti.API.info("inside onCreditHistoryButtonClicked");
    branch.getCreditHistory();
};

$.onGetCreditHistoryFinished = function(data) {
    Ti.API.info("inside onGetCreditHistoryFinished");
    showData(data);
};

$.onRedeemRewardFinished = function(data) {
    Ti.API.info("redeem reward finished");
    showData(data);
};

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
