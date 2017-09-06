var depotName = parent.depotName;
var contentGitRepoUrl = parent.originalContentGitUrl;
var hostname = parent.hostname;
var contentOnlineUrl = parent.contentOnlineUrl;
var token = parent.token;

var isWaiting = false;

var parameter = "?contentGitRepoUrl=" + encodeURIComponent(contentGitRepoUrl)
    + "&depotName=" + encodeURIComponent(depotName)
    // + "&contentOnlineUrl=" + encodeURIComponent(contentOnlineUrl)
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
                // TODO: do not automaticly resolve but on click
                apiUrl += "link/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].href = result;
                    reloadJs();
                }, linkOrImageErrorhandler(xhr))
                break;
            case "image":
                apiUrl += "image/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].src = result;
                    reloadJs();
                }, linkOrImageErrorhandler(xhr))
                break;
            case "include_inline":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                apiUrl += "&isInline=true"
                getResolveResult(apiUrl, this, function (result, that) {
                    replaceHtml(result, that);
                    // TODO: call resolve function after reloadJs()
                }, tokenOrCodeErrorHandler(xhr))
                break;
            case "include_block":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += encodeURIComponent($(this).attr('data-sourcepath'));
                apiUrl += "&isInline=false"
                getResolveResult(apiUrl, this, function (result, that) {
                    replaceHtml(result, that);
                    // TODO: call resolve function after reloadJs()
                }, tokenOrCodeErrorHandler(xhr))
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
                    replaceHtml(result, that);
                }, tokenOrCodeErrorHandler(xhr))
                break;
        }
    });
}

function getResolveType(href) {
    return href.substr(href.lastIndexOf('/') + 1);
}

function replaceHtml(result, that){
    $(that)[0].outerHTML = result;
    reloadJs();
}

function tokenOrCodeErrorHandler(xhr){
    if(xhr.status === 500 && xhr.responseJSON.error === "InternalServerError.GitNotFound"){
        alert("code or token not found!");
    }else{
        alert(xhr.status + xhr.statusText);
    }
}

function linkOrImageErrorhandler(xhr){
    if(xhr.status === 404 && xhr.responseJSON.error === "ResolveLinkFromFileMapFailed"){
        alert("link or image not exist!");
    }else{
        alert(xhr.status + xhr.statusText);
    }
}

function getResolveResult(apiUrl, that, successCallback, errorCallback) {
    $.ajax({
        url: apiUrl,
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        success: function (msg) {
            // console.log('succes: ' + msg);
            successCallback(msg, that);
        },
        error: function (xhr) {
            errorCallback(xhr);
        }
    })
}
