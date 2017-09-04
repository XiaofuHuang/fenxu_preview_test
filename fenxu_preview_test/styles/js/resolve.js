var depotName = parent.depotName;
var contentGitRepoUrl = parent.originalContentGitUrl;
var hostname = parent.hostname;
var contentOnlineUrl = parent.contentOnlineUrl;
var token = parent.token;

var isWaiting = false;

var parameter = "?contentGitRepoUrl=" + encodeURIComponent(contentGitRepoUrl)
    + "&depotName=" + encodeURIComponent(depotName)
    + "&contentOnlineUrl=" + encodeURIComponent(contentOnlineUrl)
    + "&dataSourcePath=";

$(document).ready(function () {
    resolvePlaceHolders();
});

function reloadJs() {
    if (!isWaiting) {
        isWaiting = true;
        setTimeout(() => {
            isWaiting = false;
            reloadJsCore();
        }, 300)
    }
}

function reloadJsCore() {
    var conceptual_script = $("script[src$='.conceptual.js']")[0].src;

    $.getScript(conceptual_script);
}

function resolvePlaceHolders() {
    $('.resolve').each(function () {
        var apiUrl = hostname + "resolve/";
        $(this)[0].classList.remove("resolve");
        switch (getResolveType($(this).attr('data-url'))) {
            case "link":
                apiUrl += "link/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].href = result;
                    reloadJs();
                })
                break;
            case "image":
                apiUrl += "image/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].src = result;
                    reloadJs();
                })
                break;
            case "include_inline":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                apiUrl += "&isInline=true"
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].outerHTML = result;
                    reloadJs();
                    // TODO: call resolve function after reloadJs()
                })
                break;
            case "include_block":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                apiUrl += "&isInline=false"
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].outerHTML = result;
                    reloadJs();
                    // TODO: call resolve function after reloadJs()
                })
                break;
            case "fences":
                apiUrl += "code/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                if ($(this).attr('querystringandfragment') != undefined) {
                    apiUrl += encodeURIComponent($(this).attr('querystringandfragment'));
                }
                // TODO: append information: lang, name, title
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].outerHTML = result;
                    reloadJs();
                })
                break;
        }
    });
}

function getResolveType(href) {
    return href.substr(href.lastIndexOf('/') + 1);
}

function getResolveResult(apiUrl, that, callback) {
    $.ajax({
        url: apiUrl,
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        success: function (msg) {
            console.log('succes: ' + msg);
            callback(msg, that);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    })
}
