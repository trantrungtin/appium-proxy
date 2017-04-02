appium-proxy
=======
`appium-proxy` is a proxy for appium server that supports to keep the server alive for a long time. It is suitable for running test cases belong with one session id.

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/4379558/24587351/3dae3dba-17df-11e7-83c8-5c1844ece3bc.png"/>
</p>

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
|`--real-url`|required|Original URL of Appium|`--real-url https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub`|
|`--command-timeout`|600|This used to keep the server alive (in seconds)|`--command-timeout 600`|
|`--ignore-delete-session`|true|This proxy will ignore a delete session request to keep server alive|`--ignore-delete-session true`|
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
