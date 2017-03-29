appium-proxy
=======
`appium-proxy` is a proxy for appium server that supports to keep the server alive for a long time. It is suitable for running test cases belong with one session id.

### Quick Start
Check out the source code, and then install dependencies.
```
$ git clone https://github.com/trantrungtin/appium-proxy.git
$ cd appium-proxy
$ npm install
$ npm . 
```
#### Example
```
$ node . --real-url "http://192.168.167.214:4724"
```
Go to http:\\localhost:9000\wd\hub\status and see the result. Replace your appium url by "http:\\localhost:9000\wd\hub"
