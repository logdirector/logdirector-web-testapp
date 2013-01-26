/**
 * Created with JetBrains WebStorm.
 * User: Sascha Ißbrücker
 * Date: 25.01.13
 * Time: 20:22
 *
 * Copyright (c) 2013 simonigence gmbh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var logdirector = logdirector || {};

logdirector.configure = function (url, app) {

    logdirector.baseUrl = url;
    logdirector.app = app;
};

logdirector.log = function (type, attributes) {

    // Create logging URL
    var url = logdirector.baseUrl + "/log";

    // Convert event data into parameter string for HTTP request
    var params = "";

    // Application parameter
    params += "app=" + logdirector.app;

    // Event type parameter
    params += "&type=" + type;

    // Event attributes
    if (attributes) {

        for (var key in attributes) {

            params += "&" + key + "=" + attributes[key];
        }
    }

    params = encodeURI(params);

    return logdirector.executeRequest(url, params);
};

logdirector.executeRequest = function (url, params) {

    var request = new XMLHttpRequest();

    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", params.length);
    request.setRequestHeader("Connection", "close");
    request.send(params);

    return request;
};
