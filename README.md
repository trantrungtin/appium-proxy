[![NPM version](https://img.shields.io/npm/v/appium-proxy.svg)](https://www.npmjs.com/package/appium-proxy)
[![Downloads](http://img.shields.io/npm/dm/appium-proxy.svg)](https://www.npmjs.com/package/appium-proxy)
[![Build Status](https://travis-ci.org/trantrungtin/appium-proxy.svg?branch=master)](https://travis-ci.org/trantrungtin/appium-proxy)
[![Coverage Status](https://coveralls.io/repos/github/trantrungtin/appium-proxy/badge.svg?branch=master)](https://coveralls.io/github/trantrungtin/appium-proxy?branch=master)

appium-proxy
=======
`appium-proxy` is a proxy for appium server that supports to keep the server alive for a long time. It is suitable for running test cases belong with one session id.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/4379558/24587351/3dae3dba-17df-11e7-83c8-5c1844ece3bc.png"/>
</p>

### Table of Contents
  * [Installation](#installation)
  * [Server flags](#server-flags)
  * [Use Cases](#use-cases)
    * [Setup a basic appium proxy](#setup-a-basic-appium-proxy)
    * [Setup to run parallel](#setup-to-run-parallel)

### Installation
```
$ npm install -g appium-proxy
```
### Server flags
The real-url flag is required, this proxy will use this url as a destination.


|Flag|Default|Description|Example|
|----|-------|-----------|-------|
|`-a`, `--address`|0.0.0.0|IP Address to listen on|`--address 0.0.0.0`|
|`-p`, `--port`|9000|port to listen on|`--port 9000`|
|`--real-url`|required|Original URL of Appium|`--real-url https://xyz@ondemand.saucelabs.com:443/wd/hub`|
|`--command-timeout`|600|Used to keep the server alive (in seconds)|`--command-timeout 600`|
|`--delete-session`|true|Ignore a delete session request to keep server alive|`--delete-session`|
|`--capability-identify`|id|Identify which session will be used|`--capability-identify id`|
### Use Cases
#### Setup a basic appium proxy
For example, you have a simple code like this:
```java
String serverUrl = "https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub";	
DesiredCapabilities capabilities = new DesiredCapabilities();
capabilities.setCapability("browserName", "chrome"); 
capabilities.setCapability("deviceName", "Galaxy J7");
capabilities.setCapability("platformVersion", "5.1.1");
capabilities.setCapability("platformName", "Android"); 
capabilities.setCapability("id", "id1"); // you have to add this capability

AppiumDriver<WebElement> driver = new AndroidDriver<WebElement>(new URL(serverUrl), capabilities);
```
First, you have to start the appium proxy with that server url.
```
$ appium-proxy --real-url "https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub"
```
Secondly, replaced your appium url by "http://localhost:9000"
```java
String serverUrl = "http://localhost:9000";	
```
#### Setup to run parallel
Sometimes, you need to run a parallel execution. We provide a flag named capability-identify that can identify which the session which belongs to.
```
$ appium-proxy --real-url "https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub" --identify-session-key id
```
Now you can replace your url as "http://localhost:9000". 
Declared the first one:
```java
DesiredCapabilities capabilities = new DesiredCapabilities();
capabilities.setCapability("browserName", "chrome"); 
capabilities.setCapability("deviceName", "Galaxy J7");
capabilities.setCapability("platformVersion", "5.1.1");
capabilities.setCapability("platformName", "Android"); 
capabilities.setCapability("id", "id1");

AppiumDriver<WebElement> driver1 = new AndroidDriver<WebElement>(new URL(serverUrl), capabilities);
```
Declared the second one:
```java
DesiredCapabilities capabilities = new DesiredCapabilities();
capabilities.setCapability("browserName", "chrome"); 
capabilities.setCapability("deviceName", "Galaxy S6");
capabilities.setCapability("platformVersion", "6.0.1");
capabilities.setCapability("platformName", "Android"); 
capabilities.setCapability("id", "id2");

AppiumDriver<WebElement> driver2 = new AndroidDriver<WebElement>(new URL(serverUrl), capabilities);
```
To know which sessions are used please enter "http://localhost:9000/json"
