var depotName = "MSDN.fenxu_preview_test_ppe";
var contentGitRepoUrl = "https://github.com/fenxuorg/fenxu_preview_test_ppe/blob/master/fenxu_preview_test_ppe/sample.md";
var hostname = "https://op-build-sandbox2.azurewebsites.net/";
var token = "3a7b682a-1040-4228-98e9-4dbce74938a5"

var shouldReloadJs = false;
var isWaiting = false;

var parameter = "?contentGitRepoUrl=" + encodeURIComponent(contentGitRepoUrl)
    + "&depotName=" + encodeURIComponent(depotName)
    + "&contentOnlineUrl=" + encodeURIComponent("https://ppe.docs.microsoft.com/en-us/fenxu_preview_test/sample")
    + "&dataSourcePath=";

$(document).ready(function () {
    resolvePlaceHolders();
});

function reloadJs() {
    if (shouldReloadJs) {
        if (!isWaiting) {
            isWaiting = true;
            setTimeout(() => {
                isWaiting = false;
                reloadJsCore();
            }, 300)
        }
    }
}

function reloadJsCore() {
    var conceptual_script = $("script[src$='.conceptual.js']")[0].src;

    $.getScript(conceptual_script);
}

function resolvePlaceHolders() {
    $('.resolve').each(function () {
        var apiUrl = hostname + "resolve/";
        switch (getResolveType($(this).attr('data-url'))) {
            case "link":
                apiUrl += "link/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].classList.remove("resolve");
                    $(that)[0].href = result;
                    reloadJs();
                })
                break;
            case "image":
                apiUrl += "image/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].classList.remove("resolve");
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
                if($(this).attr('querystringandfragment') != undefined){
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