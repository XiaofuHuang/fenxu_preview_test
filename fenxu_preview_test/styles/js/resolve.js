var depotName = "test.fenxu_preview_test";

var hostname = "https://op-build-perf.azurewebsites.net/";
var token = "dfde23c0-79e6-46bf-8b24-9332096a5d11"

var parameter = "?contentGitRepoUrl=https://github.com/fenxuorg/fenxu_preview_test/blob/master/fenxu_preview_test/sample.md"
    + "&depotName=" + depotName
    + "&isInline=false"
    + "&contentOnlineUrl=https://ppe.docs.microsoft.com/en-us/fenxu_preview_test/sample"
    + "&dataSourcePath="

$(document).ready(function () {
    resolvePlaceHolders();
});

function resolvePlaceHolders() {
    $('.resolve').each(function () {
        var apiUrl = hostname + "resolve/";
        switch (getResolveType($(this).attr('data-url'))) {
            case "link":
                apiUrl += "link/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, function (result) {
                    $(this)[0].href = result;
                })
                break;
            case "image":
                apiUrl += "image/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, function (result) {
                    $(this)[0].src = result;
                })
                break;
            case "include_inline":
            case "include_block":
                apiUrl += "token/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, function (result) {
                    $(this)[0].outerHTML = result;
                })
                break;
            case "fences":
                apiUrl += "code/";
                apiUrl += parameter;
                apiUrl += $(this).attr('data-sourcepath');
                getResolveResult(apiUrl, function (result) {
                    $(this)[0].outerHTML = result;
                })
                break;
        }
    });
}

function getResolveType(href) {
    return href.substr(href.lastIndexOf('/') + 1);
}

function getResolveResult(apiUrl, callback) {
    $.ajax({
        url: apiUrl,
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        success: function (msg) {
            console.log('succes: ' + msg);
            callback(msg);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    })
}