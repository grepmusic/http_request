window.onload = function () {
    var get_request_headers = function (request_headers) {
        var headers, header, m;
        if(arguments.length < 1)
            request_headers = $('request_headers').value;
        if(typeof request_headers === 'string') {
            var headers = request_headers;
            request_headers = {};
            headers = headers.split(/(?:\r?\n)+/);
            for(header in headers) {
                header = headers[header];
                m = /^ *([\w-]+) *: /.exec(header);
                if(m) {
                    request_headers[ m[1].toLowerCase() ] = header.substr(header.indexOf(':') + 2);
                }
            }
        }
        return request_headers || {};
    }
    var http_request = function(url, method, request_headers, form_data, options) {

        options = options || {};
        request_headers = request_headers || {};

        var xhr = new XMLHttpRequest();

        // 0 (uninitialized) 1(loading) 2(loaded) 3(interactive) 4(complete)
        var handlers = [ 'onUninitialized', 'onLoading', 'onLoaded', 'onInteractive', 'onComplete' ];
        xhr.addEventListener('readystatechange', function (evt) {
            var stat = xhr.readyState;
            var handler = handlers[stat];
            if(typeof options[handler] === 'function') {
                options[handler](evt, xhr);
            }
            if(stat == 4 && xhr.status == 200 && typeof options.onSucess === 'function') {
                options.onSucess(evt, xhr);
            }
        });

        var def_opts = { async: true, user: undefined, password: undefined };
        for(var p in def_opts) {
            if(! options.hasOwnProperty(p)) {
                options[p] = def_opts[p];
            }
        }

        // void open(DOMString method, DOMString url, optional boolean async, optional DOMString user, optional DOMString password );
        xhr.open(method, url, options.async, options.user, options.password);

        if(method === 'POST' && ! request_headers['content-type']) {
            request_headers['content-type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        }
        for(header in request_headers) {
            try { xhr.setRequestHeader(header, request_headers[header]); } catch (e) { console.log(e); }
        }

        if(form_data) {
            xhr.send(form_data);
        } else {
            xhr.send();
        }
    }
    var $ = function (id) { return document.getElementById(id); }
    $('request').onclick = function () {
        var url = $('url').value.replace(/^\s+|\s+$/g, '');
        if(url && ! url.match(/^https?:\/\/$/i)) {
            var headers = get_request_headers();
            chrome.extension.sendRequest(headers, function(response) {
                console.log('responded from background javascript');
                http_request($('url').value, $('method').value, headers, $('form_data').value, {
                    onComplete: function (evt, xhr) {
                        $('response_text').value = xhr.responseText;
                        $('response_headers').value = xhr.getAllResponseHeaders().replace(/^\s+|\s+$/g, '');
                    }
                });
            });
        } else {
            alert('please input url');
        }
    }
    $('url').focus();
}
