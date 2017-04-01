appium-proxy
=======
`appium-proxy` is a proxy for appium server that supports to keep the server alive for a long time. It is suitable for running test cases belong with one session id.

### Quick Start

```
$ npm install -g appium-proxy
```
#### Example
```
$ appium-proxy --real-url "https://tinonsoftware:123456789@ondemand.saucelabs.com:443/wd/hub"
```
Replaced your appium url by "http://localhost:9000"
