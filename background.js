(function () {
    chrome.webRequest.onBeforeSendHeaders.addListener(
        function(details) {
            var unsafe_headers = window.unsafe_headers;
            if(! unsafe_headers)
                return {requestHeaders: details.requestHeaders};

            var header;
            for (var i = 0; i < details.requestHeaders.length; ++i) {
                header = details.requestHeaders[i].name.toLowerCase();
                if(unsafe_headers.hasOwnProperty(header)) {
                    details.requestHeaders[i].value = unsafe_headers[header];
                }
            }

            window.unsafe_headers = null;
            return {requestHeaders: details.requestHeaders};
        },
        {urls: ["<all_urls>"]},
        ["requestHeaders", "blocking"]);

    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            sendResponse({});
            window.unsafe_headers = request;
        });
})();