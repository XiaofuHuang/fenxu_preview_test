var depotName = "test.fenxu_preview_test";

var hostname = "https://op-build-perf.azurewebsites.net/";
var token = "4c823882-4c6c-4e01-934b-8310c1c71a82"

var shouldReloadJs = false;
var isWaiting = false;

var parameter = "?contentGitRepoUrl=https://github.com/fenxuorg/fenxu_preview_test/blob/master/fenxu_preview_test/sample.md"
    + "&depotName=" + depotName
    + "&isInline=false"
    + "&contentOnlineUrl=https://ppe.docs.microsoft.com/en-us/fenxu_preview_test/sample"
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

            }, 300)
        }
    }
}

function reloadJsCore() {
    // TODO: Hard code resolve
    var script_arr = [
        '/_themes/docs.theme/master/en-us/_themes/global/js/global.min.js',
        '/_themes/docs.theme/master/en-us/_themes/javascript/b55c2ce2849231e14ff4.conceptual.js'
    ];

    $.getScript(script_arr);
}

function resolvePlaceHolders() {
    $('.resolve').each(function () {
        var apiUrl = hostname + "resolve/";
        switch (getResolveType($(this).attr('data-url'))) {
            case "link":
                apiUrl += "link/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].href = result;
                    reloadJs();
                })
                break;
            case "image":
                apiUrl += "image/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].src = result;
                    reloadJs();
                })
                break;
            case "include_inline":
            case "include_block":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, this, function (result, that) {
                    $(that)[0].outerHTML = result;
                    reloadJs();
                })
                break;
            case "fences":
                apiUrl += "code/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
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