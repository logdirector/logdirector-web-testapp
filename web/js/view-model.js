/**
 * Created with JetBrains WebStorm.
 * User: Sascha Ißbrücker
 * Date: 26.01.13
 * Time: 11:00
 *
 * Copyright (c) 2013 simonigence gmbh
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var Attribute = function (title, attributeKey, type, value) {

    var self = this;

    self.title = ko.observable(title);
    self.attributeKey = ko.observable(attributeKey);
    self.type = ko.observable(type);
    self.value = ko.observable(value);
    self.default = ko.observable(value);

    self.useTextArea = ko.computed(function() {

        return self.type() == 'exception';
    });

};

var LogButtonStyles = {};

LogButtonStyles.default = 0;
LogButtonStyles.success = 1;
LogButtonStyles.error = 2;

var EventType = function (title, eventKey, fields) {

    var self = this;

    self.title = ko.observable(title);
    self.eventKey = ko.observable(eventKey);
    self.fields = ko.observableArray(fields);
    self.buttonStyle = ko.observable(LogButtonStyles.default);
    self.intervalId = null;

    self.log = function (event) {

        self.resetButtonStyle();

        var attributes = {};

        for (var index = 0; index < event.fields().length; index++) {

            var field = event.fields()[index];

            attributes[field.attributeKey() + ":" + field.type()] = field.value();
        }

        var request = logdirector.log(event.eventKey(), attributes);

        request.onreadystatechange = function() {

            if(request.readyState == 4) {

                // Check if the event was stored
                if(request.responseText && request.responseText.indexOf('Failed events=0') >= 0) {

                    // Set button to success mode
                    self.setButtonStyle(LogButtonStyles.success);

                } else {

                    // Show error notification
                    $('.top-right').notify({
                        type: 'error',
                        message: { text: 'Oops! That didn\'t work - try to change your values.' }
                    }).show();

                    // Set button to error mode
                    self.setButtonStyle(LogButtonStyles.error);
                }
            }
        };
    };

    self.reset = function () {

        for (var index = 0; index < self.fields().length; index++) {

            var field = self.fields()[index];

            field.value(field.default());
        }
    };

    self.setButtonStyle = function(style) {

        self.buttonStyle(style);
        self.intervalId = setTimeout(self.resetButtonStyle, 2500);
    };

    self.resetButtonStyle = function() {
        self.buttonStyle(LogButtonStyles.default);
        clearTimeout(self.intervalId);
    };

    self.buttonText = ko.computed(function() {

        return self.buttonStyle() == LogButtonStyles.default ? 'Log' : (self.buttonStyle() == LogButtonStyles.success ? 'Sucess' : 'Error');
    });

    self.useDefaultButtonStyle = ko.computed(function() {
        return self.buttonStyle() == LogButtonStyles.default;
    });

    self.useSuccessButtonStyle = ko.computed(function() {
        return self.buttonStyle() == LogButtonStyles.success;
    });

    self.useErrorButtonStyle = ko.computed(function() {
        return self.buttonStyle() == LogButtonStyles.error;
    });

};

var Example = function (title, appKey, description, events) {

    var self = this;

    self.title = ko.observable(title);
    self.appKey = ko.observable(appKey);
    self.description = ko.observable(description);
    self.events = ko.observableArray(events);

    self.isEditApp = ko.observable(false);

    self.editApp = function() {

        self.isEditApp(true);
    }

    self.finishEditApp = function() {

        self.isEditApp(false);

        // Reconfigure our client with the changed key
        logdirector.configure("http://test.logdirector.com/logdirector", self.appKey());
    }

};

var ViewModel = function () {

    var self = this;

    // region Examples

    // File job example
    var fileJobExample = new Example("File job example", "File job", "Log events from a job that processes all files from an input folder and saves the processed result in an output folder.", [

        new EventType("Job started", "Job started", [

            new Attribute("Input folder", "Input folder", "string", "public/file-job/in"),
            new Attribute("Output folder", "Output folder", "string", "public/file-job/out")
        ]),

        new EventType("File processed", "Job file processed", [

            new Attribute("File name", "File name", "string", "products.xml"),
            new Attribute("File size", "File size", "integer", "8248")
        ]),

        new EventType("Job finished", "Job finished", [

            new Attribute("File count", "File count", "integer", "32"),
            new Attribute("Success count", "Success count", "integer", "30"),
            new Attribute("Error count", "Error count", "integer", "2")
        ])
    ]);

    // Exception example
    var exceptionExample = new Example("Exception example", "Exception logger", "Log an exception with stacktrace, complete with class name, method name and line number.", [

        new EventType("Error message", "Error message", [
            new Attribute("Message", "Message", "string", "Error loading user from DB."),
            new Attribute("Severity", "Severity", "string", "high"),
            new Attribute("Exception", "Exception", "exception", JSON.stringify({
                "platform":"java",
                "exceptionInfo":{
                    "type":"org.company.app.exceptions.BackendException",
                    "message":"Error selecting user by id",
                    "stacktrace":[
                        {
                            "className":"org.company.app.persistence.UserDao",
                            "fileName":"UserDao.java",
                            "lineNumber":"32",
                            "methodName":"selectById"
                        }
                    ],
                    "cause":{
                        "type":"java.sql.SQLException",
                        "message":"Column 'pk_useId' not found.",
                        "stacktrace":[
                            {
                                "className":"com.mysql.jdbc.SQLError",
                                "fileName":"SQLError.java",
                                "lineNumber":"1073",
                                "methodName":"createSQLException"
                            }
                        ]
                    }
                }
            }))
        ])
    ]);

    // Document management example
    var documentExample = new Example("Document management example", "Document manager", "Log data from an application that manages documents.", [

        new EventType("Document added", "Document added", [

            new Attribute("Title", "Title", "string", "How to eat 10 bananas in 1 minute"),
            new Attribute("Document id", "Id", "integer", "38546"),
            new Attribute("Document type", "Type", "string", "Tutorial"),
            new Attribute("User name", "User", "string", "Homer Simpson")
        ]),

        new EventType("Document versioned", "Document versioned", [

            new Attribute("Document id", "Id", "integer", "38546"),
            new Attribute("Document version", "Version", "string", "1.1"),
            new Attribute("User name", "User", "string", "Homer Simpson")
        ]),

        new EventType("Document archived", "Document archived", [

            new Attribute("Document id", "Id", "integer", "38546"),
            new Attribute("User name", "User", "string", "Homer Simpson")
        ])
    ]);

    // Web site example
    var websiteExample = new Example("Website example", "Web site", "Log custom usage data from a web site like page visits or searches.", [

        new EventType("Page visit", "Page visit", [

            new Attribute("Page", "Page", "string", "/index.html"),
            new Attribute("Browser", "Browser", "string", "Chrome"),
            new Attribute("IP address", "IP", "string", "127.0.0.1")
        ]),

        new EventType("Search", "Page search", [

            new Attribute("Search query", "Query", "string", "Santa"),
            new Attribute("Page", "Page", "string", "/index.html")
        ])
    ]);

    // Create example array
    self.examples = ko.observableArray([
        exceptionExample,
        fileJobExample,
        documentExample,
        websiteExample
    ]);

    self.selectedExample = ko.observable(null);

    // endregion

    self.initialize = function () {

        // Select initial example
        self.selectExample(exceptionExample);
    };

    self.selectExample = function (example) {

        self.selectedExample(example);

        logdirector.configure("http://test.logdirector.com/logdirector", example.appKey());
    };

    self.hasDismissedInfoAlert = ko.observable(false);

    self.isInfoAlertVisible = ko.observable(false);

    self.showInfoAlert = function() {

        if(!self.hasDismissedInfoAlert())
            self.isInfoAlertVisible(true);
    };

    self.dismissInfoAlert = function() {

        self.hasDismissedInfoAlert(true);
        self.isInfoAlertVisible(false);
    };
};