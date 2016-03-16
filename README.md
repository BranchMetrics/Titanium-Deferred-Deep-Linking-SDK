# Branch Titanium SDK

## Full documentation

Exhaustive documentation can be found on our [documentation portal](https://dev.branch.io).  you may also find our [support portal and user forums](http://support.branch.io) helpful.

This is a repository of our open source Branch SDK for Titanium, and the information presented here serves as a reference
manual for our Titanium modules. See the table of contents below for a complete list of the content featured in this
document.

_____

## Demo App

There's a full demo app embedded in the repository, but you should also check out our live demo: Branch Monster Factory. We've open sourced the Branchster's app as well if you'd like to dig in.

___

## Register Your App

You can sign up for your own Branch key at https://dashboard.branch.io

___

## Installation

### Android Module Installation

1. Navigate to the `android/dist` folder (in the root directory of this repo) OR [download the zip file of the module](https://s3-us-west-1.amazonaws.com/branchhost/Branch-Titanium-Android-SDK.zip)
2. Extract the contents
3. Copy the `android` folder to your titanium `modules` folder.

### iOS Module Installation

1. Navigate to the `iphone` folder (in the root directory of this repo) OR [download the zip file of the module](https://s3-us-west-1.amazonaws.com/branchhost/Branch-Titanium-iOS-SDK.zip)
2. Extract the contents
3. Copy the `iphone` folder to your titanium `modules` folder.

___

## Configure your app for deep linking

## Android: Register a URI Scheme and add your Branch key

In your project's `tiapp.xml` file, you can register your app to respond to direct deep links (`yourapp://` in a mobile
browser) by adding the second intent filter block. Also, make sure to change `yourapp` to a unique string that
represents your app name.

Secondly, make sure that this activity is launched as a singleTask. This is important to handle proper deep linking
from other apps like Facebook.

```xml
<activity
    android:name=".TestbedActivity"
    android:label="@string/app_name"
    <!-- Make sure the activity is launched as "singleTask" -->
    android:launchMode="singleTask">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- Add this intent filter below, and change yourapp to your app name -->
    <intent-filter>
        <data android:scheme="yourapp" android:host="open" />
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
    </intent-filter>
</activity>
```

After you register your app, your Branch key can be retrieved on the Settings page of the dashboard. Add it
(them, if you want to do it for both your live and test apps) to your project's manifest file as a meta data.

Edit your manifest file to have the following items:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="io.branch.sample"
    android:versionCode="1"
    android:versionName="1.0" >

    <uses-permission android:name="android.permission.INTERNET" />

    <application>
        <!-- Other existing entries -->

        <!-- Add this meta-data below, and change "key_live_xxxxxxx" to your actual live Branch key -->
        <meta-data android:name="io.branch.sdk.BranchKey" android:value="key_live_xxxxxxx" />

        <!-- For your test app, if you have one; Again, use your actual test Branch key -->
        <meta-data android:name="io.branch.sdk.BranchKey.test" android:value="key_test_yyyyyyy" />
    </application>
</manifest>
```

### iOS: Register a URI Scheme and add your Branch key

In your project's `tiapp.xml` file:

1. You can register your app to respond to direct deep links (`yourapp://` in a mobile browser) by adding `CFBundleURLTypes` block. Also, make sure to change `yourapp` to a unique string that represents your app name.
In https://dashboard.branch.io/#/settings/link, tick `I have an iOS App` checkbox and enter your URI Scheme (e.g.: `yourapp://`) into the text box.
2. Add your `Branch key` found on the settings page here https://dashboard.branch.io/#/settings

```xml
  <ios>
    <plist>
      <dict>
        <!-- Add branch key as key-value pair -->
        <key>branch_key</key>
        <string>key_live_xxxxxxxxxxxxxxx</string>
        <!-- Add unique string for direct deep links -->
        <key>CFBundleURLTypes</key>
        <array>
          <dict>
            <key>CFBundleURLSchemes</key>
            <array>
              <string>yourapp</string>
            </array>
          </dict>
        </array>
      </dict>
    </plist>
  </ios>
```

### iOS: Enable Universal Links

In iOS 9.2, Apple dropped support for URI scheme redirects. You must enable Universal Links if you want Branch-generated links to work in your iOS app. To do this:

1. enable `Associated Domains` capability on the Apple Developer portal when you create your app's bundle identifier.
2. In https://dashboard.branch.io/#/settings/link, tick the `Enable Universal Links` checkbox and provide the Bundle Identifier and Apple Team ID in the appropriate boxes.
3. Finally, create a new file named `Entitlements.plist` in the same directory as your Titanium app's `tiapp.xml` with the `associated-domains` key like below. You may add more entitlement keys if you have any.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
      <key>com.apple.developer.associated-domains</key>
      <array>
          <string>applinks:bnc.lt</string>
      </array>
  </dict>
</plist>
```

### iOS: Handle Universal Links on Cold Start

Due to some certain limitations (at the time of writing), the module will not be able to handle data when clicking Universal Links while the app is not running at all.
To solve this issue, you have to implement a listener to the 'continueactivity' on your Titanium app, retrieve the parameters and pass it to the module's `continueUserActivity` method. You can see an example of how this is implemented in [our testbed code](https://github.com/BranchMetrics/Titanium-Deferred-Deep-Linking-SDK/blob/master/testbed/app/controllers/index.js#L86).

To implement, first add an entry to `NSUserActivityTypes` in your plist file.

```xml
<plist>
  <dict>
    ....
    <key>NSUserActivityTypes</key>
    <array>
      <string>io.branch.testbed.universalLink</string> // This is only a sample. Use reverse domain.
    </array>
  </dict>
</plist>
```

First, create a User Activity with the same name as you registered above and then add a listener to the event `continueactivity`:

```js
if (OS_IOS) { // Don't forget this condition.
    var activity = Ti.App.iOS.createUserActivity({
        activityType:'io.branch.testbed.universalLink'
    });

    activity.becomeCurrent();

    Ti.App.iOS.addEventListener('continueactivity', function(e) {
        if (e.activityType === 'io.branch.testbed.universalLink') {
            branch.continueUserActivity(e.activityType, e.webpageURL, e.userInfo);
        }
    });
}
```

**Note:** The Universal Link data will be available in the initSession callback - the above snippet is just to work around a Titanium deficiency. See [initSession()](#initsession).

___

## API Reference

1. Branch Session
  + [.initSession()](#initsession)
  + [.getLatestReferringParams()](#getlatestreferringparams)
  + [.getFirstReferringParams()](#getfirstreferringparams)
  + [.setIdentity(identity)](#setidentity)
  + [.logout()](#logout)
  + [.userCompletedAction()](#usercompletedaction)

2. Branch Universal Object
  + [.createBranchUniversalObject(options)](#createbranchuniversalobjectoptions)
  + [.registerView()](#registerview)
  + [.generateShortUrl(options, controlParameters)](#generateshorturloptions-controlparameters)
  + [.showShareSheet(options, controlParameters)](#showsharesheetoptions-controlparameters)

3. Referral System Rewarding
  + [.loadRewards()](#loadrewards)
  + [.redeemRewards(value)](#redeemrewards-value)
  + [.getCreditHistory()](#get-credit-history)

___

* * *

### setDebug()

Setting the SDK debug flag will generate a new device ID each time the app is installed
instead of possibly using the same device id.  This is useful when testing.

##### Usage

```js
branch.setDebug(true);
```

This needs to be set before the Branch.init call!!!

___


### initSession()

Initializes the branch instance.

##### Usage
```js
branch.initSession();
```

##### Callback
To implement the callback, you must add a listener to the event `bio:initSession`.
The event returns a dictionary object where you can read the link the user was referred by and other related data.

Branch returns explicit parameters every time. Here is a list, and a description of what each represents.

* `~` denotes analytics
* `+` denotes information added by Branch
* (for the curious, `$` denotes reserved keywords used for controlling how the Branch service behaves)

| **Parameter** | **Meaning**
| --- | ---
| ~channel | The channel on which the link was shared, specified at link creation time
| ~feature | The feature, such as `invite` or `share`, specified at link creation time
| ~tags | Any tags, specified at link creation time
| ~campaign | The campaign the link is associated with, specified at link creation time
| ~stage | The stage, specified at link creation time
| ~creation_source | Where the link was created ('API', 'Dashboard', 'SDK', 'iOS SDK', 'Android SDK', or 'Web SDK')
| +match_guaranteed | True or false as to whether the match was made with 100% accuracy
| +referrer | The referrer for the link click, if a link was clicked
| +phone_number | The phone number of the user, if the user texted himself/herself the app
| +is_first_session | Denotes whether this is the first session (install) or any other session (open)
| +clicked_branch_link | Denotes whether or not the user clicked a Branch link that triggered this session
| +click_timestamp | Epoch timestamp of when the click occurred


**Note:** `Branch.initSession()` must be called prior to calling any other Branch functions.

___



### getLatestReferringParams()

Retrieves the session (install or open) parameters.

##### Usage
```js
var sessionParams = branch.getLatestReferringParams();
```

___



### getFirstReferringParams()

Retrieves the install session parameters.

##### Usage
```js
var installParams = branch.getFirstReferringParams();
```

___



### setIdentity(identity)

Sets the identity of a user and returns the data. To use this function, pass
a unique string that identifies the user - this could be an email address,
UUID, Facebook ID, etc.

**Parameters**

**identity**: `string`, _required_ - a string uniquely identifying the user – often a user ID or email address.

##### Usage
```js
branch.setIdentity(identity);
```

___



### logout()

Logs out the current session, replaces session IDs and identity IDs.

##### Usage
```js
branch.logout();
```

___



### userCompletedAction(customAction)

Registers custom events.

**Parameters**

**customAction**: `string`, _required_ - a string for your custom action (e.g. "complete_purchase", "wrote_message", "finished_level_ten", etc).

##### Usage
```js
branch.userCompletedAction(customAction);
```

___



## Branch Universal Object

As more methods have evolved in iOS, we've found that it was increasingly hard to manage them all. We abstracted as many as we could into the concept of a Branch Universal Object. This is the object that is associated with the thing you want to share (content or user). You can set all the metadata associated with the object and then call action methods on it to get a link or index in Spotlight.

### createBranchUniversalObject(options)

**Parameters**

**options**: `dictionary`, _required_ - options in creating the object.

| **Key** | Type | **Meaning**
| --- | --- |---
| canonicalIdentifier | `string` | The identifier of the object
| title | `string` | The title of the object
| contentDescription | `string` | The short description of the object
| contentImageUrl | `string` | URL of the image used by the object
| contentIndexingMode | `string` | Indexing mode of the object. Set as "private" or "public".
| contentMetadata | `dictionary` | Custom keys and values as metadata of the object


##### Usage
```js
var branchUniversalObject = branch.createBranchUniversalObject({
  "canonicalIdentifier" : "sample-id",
  "title" : "Sample",
  "contentDescription" : "This is a sample",
  "contentImageUrl" : "http://sample-host.com/media/1235904.jpg",
  "contentIndexingMode" : "private",
  "contentMetadata" : {
      "key" : "value",
      "key2" : "value2"
  },
});
```

___



### registerView()

If you want to track how many times a user views a particular piece of content, you can call this method in `viewDidLoad` or `viewDidAppear` to tell Branch that this content was viewed.

##### Usage
```js
branchUniversalObject.registerView();
```

___



### generateShortUrl(options, controlParameters)

Once you've created your `Branch Universal Object`, which is the reference to the content you're interested in, you can then get a link back to it with the mechanism described below.

**Parameters**

**options**: `dictionary`, _required_ - options needed to generate the URL.

| **Key** | Type | **Meaning**
| --- | --- |---
| feature | `string` | The feature of the link
| alias | `string` | The alias of the link
| channel | `string` | The channel of the link
| stage | `string` | The stage of the link
| duration | `int` | duration of the link.

**controlParameters**: `dictionary`, _required_ - link properties needed to generate the URL.

| **Key** | Type | **Meaning**
| --- | --- |---
| $fallback_url | `string` | The fallback URL
| $desktop_url | `string` | The URL for desktop
| $android_url | `string` | The URL for Android
| $ios_url | `string` | The URL for iPhone
| $ipad_url | `string` | The URL for iPad
| $fire_url | `string` | The URL for Kindle Fire
| $blackberry_url | `string` | The URL for Blackberry
| $windows_phone_url | `string` | The URL for Windows phone

##### Usage
```js
branchUniversalObject.generateShortUrl({
  "feature" : "sample-feature",
  "channel" : "sample-channel",
  "stage" : "sample-stage"
}, {
  "$desktop_url" : "http://desktop-url.com",
});
```

##### Callback
To implement the callback, you must add a listener to the event `bio:generateShortUrl`.
The event returns a string object containing the generated link.

**Note:** Avoid passing `alias` in iOS. Adding an `alias` key in the `options` parameter will return a Non-Universal link which will not work in iOS 9.2.

___



### showShareSheet(options, controlParameters, contentParams)

UIActivityView is the standard way of allowing users to share content from your app. Once you've created your `Branch Universal Object`, which is the reference to the content you're interested in, you can then automatically share it _without having to create a link_ using the mechanism below..

**Sample UIActivityView Share Sheet**

![UIActivityView Share Sheet](https://dev.branch.io/img/ingredients/sdk_links/ios_share_sheet.jpg)

The Branch iOS SDK includes a wrapper on the UIActivityViewController, that will generate a Branch short URL and automatically tag it with the channel the user selects (Facebook, Twitter, etc.).

**Parameters**

**options**: `dictionary`, _required_ - options for the share sheet.

| **Key** | Type | **Meaning**
| --- | --- |---
| feature | `string` | The feature of the link
| alias | `string` | The alias of the link
| channel | `string` | The channel of the link
| stage | `string` | The stage of the link
| duration | `int` | duration of the link.

**controlParameters**: `dictionary`, _required_ - link properties needed to generate the URL.

| **Key** | Type | **Meaning**
| --- | --- |---
| $fallback_url | `string` | The fallback URL
| $desktop_url | `string` | The URL for desktop
| $android_url | `string` | The URL for Android
| $ios_url | `string` | The URL for iPhone
| $ipad_url | `string` | The URL for iPad
| $fire_url | `string` | The URL for Kindle Fire
| $blackberry_url | `string` | The URL for Blackberry
| $windows_phone_url | `string` | The URL for Windows phone
| $email_subject | `string` | Title string used on sharing options
| $email_body | `string` | Body string used on sharing options

##### Usage
```js
branchUniversalObject.showShareSheet({
  "feature" : "sample-feature",
  "channel" : "sample-channel",
  "stage" : "sample-stage",
  "duration" : 1,
}, {
  "$desktop_url" : "http://desktop-url.com",
  "$email_subject" : "This is a sample subject",
  "$email_body" : "This is a sample body",
});
```

##### Callback
To implement the callback, you must add listeners to the following events:

`bio:shareLinkDialogLaunched`
- The event fires when the share sheet is presented.

`bio:shareLinkDialogDismissed`
- The event fires when the share sheet is dismissed.

`bio:shareLinkResponse`
- The event returns a dictionary of the response data.

`bio:shareChannelSelected`
- The event fires a channel is selected.

**Note:** Callbacks in iOS are ignored. There is no need to implement them as the events are handled by `UIActivityViewController`.

**Note:** Avoid passing `alias` in iOS. Adding an `alias` key in the `options` parameter will return a Non-Universal link which will not work in iOS 9.2.

___


## Referral System Rewarding


### loadRewards()

Reward balances change randomly on the backend when certain actions are taken (defined by your rules), so you'll need to make an asynchronous call to retrieve the balance. Here is the syntax:

##### Usage
```js
branch.loadRewards();
```

##### Callback

To implement the callback, you must add a listener to the event `bio:loadRewards`.
The event returns a dictionary object containing the balance.

___


### redeemRewards(value)

Redeems a reward with the given amount/value.

**Parameters**

**value**: `int`, _required_ - amount to be redeemed.

##### Usage
```js
branch.redeemRewards(value);
```

___

## Get credit history

This call will retrieve the entire history of credits and redemptions from the individual user. To use this call,
implement like so:

```js
branch.getCreditHistory();
```

Then implement the callback, by adding a listener to the event `bio:getCreditHistory`.

The response will return an array that has been parsed from the following JSON:

```js
[
    {
        "transaction": {
                           "date": "2014-10-14T01:54:40.425Z",
                           "id": "50388077461373184",
                           "bucket": "default",
                           "type": 0,
                           "amount": 5
                       },
        "event" : {
            "name": "event name",
            "metadata": { your event metadata if present }
        },
        "referrer": "12345678",
        "referree": null
    },
    {
        "transaction": {
                           "date": "2014-10-14T01:55:09.474Z",
                           "id": "50388199301710081",
                           "bucket": "default",
                           "type": 2,
                           "amount": -3
                       },
        "event" : {
            "name": "event name",
            "metadata": { your event metadata if present }
        },
        "referrer": null,
        "referree": "12345678"
    }
]
```

**referrer**

The id of the referring user for this credit transaction. Returns null if no referrer is involved. Note this id is the user id in developer's own system that's previously passed to Branch's identify user API call.

**referree**

The id of the user who was referred for this credit transaction. Returns null if no referree is involved. Note this id is the user id in developer's own system that's previously passed to Branch's identify user API call.

**type**

This is the type of credit transaction
1. 0 - A reward that was added automatically by the user completing an action or referral
2. 1 - A reward that was added manually
3. 2 - A redemption of credits that occurred through our API or SDKs
4. 3 - This is a very unique case where we will subtract credits automatically when we detect fraud


## Bugs / Help / Support

Feel free to report any bugs you might encounter in the repo's issues. Any support inquiries outside of bugs
please send to [support@branch.io](mailto:support@branch.io).
