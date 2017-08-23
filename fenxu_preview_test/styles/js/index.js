// var isOnlinePreview = true;

// var hostname;
// var token;
// if (isOnlinePreview) {
//     hostname = "https://op-build-sandbox2.azurewebsites.net/";
//     token = "e8962712-dd2e-4b47-9bb7-9c380f22282d"
// } else {
//     hostname = "https://localhost/openpublishing/api/";
//     token = "85896a10-abae-49b4-9c45-77850c2e2e69"
// }

var depotName = "test.fenxu_preview_test";
var gitRepoUrl = "https://github.com/fenxuorg/fenxu_preview_test/";
var relativePath = "fenxu_preview_test/sample.md";

var hostname = "https://op-build-perf.azurewebsites.net/";
var token = "dfde23c0-79e6-46bf-8b24-9332096a5d11"
var isOnlinePreview = true;

var parameter = "?contentGitRepoUrl=https://github.com/fenxuorg/fenxu_preview_test/blob/master/fenxu_preview_test/sample.md"
    + "&depotName=" + depotName
    + "&isInline=false"
    + "&contentOnlineUrl=https://ppe.docs.microsoft.com/en-us/fenxu_preview_test/sample"
    + "&dataSourcePath="

$(document).ready(function () {
    $("button").click(function () {
        var markupRequest = {
            "markdown_content": document.getElementById("in").innerText.replace(/\u200B/g, ''),
            "repository_url": "https://github.com",
            "branch": "master",
            "relative_path": "index.md",
            "depot_name": "test"
        };

        $.ajax({
            type: "POST",
            url: hostname + "markup",
            headers: {
                "Content-Type": "application/json",
                "X-OP-BuildUserToken": token
            },
            data: JSON.stringify(markupRequest),
            success: function (msg) {
                console.log('succes: ' + msg);
                callRender(msg);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            }
        })
    });
});

function callRender(markupResult) {
    var rawJson = {
        "content": markupResult,
        "rawMetadata": {
            "layout": "Conceptual",
            "fileRelativePath": "index.html",
        },
        "themesRelativePathToOutputRoot": "_themes/"
    }

    var renderRequest = {
        "html_content": JSON.stringify(rawJson),
        "is_online_preview": isOnlinePreview,
        "repository_url": gitRepoUrl,
        "branch": "master",
        "relative_path": relativePath,
        "depot_name": depotName,
        "locale": "en-us"
    }

    $.ajax({
        type: "POST",
        url: hostname + "render",
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        data: JSON.stringify(renderRequest),
        success: function (msg) {
            console.log('succes: ' + msg);
            refreshIframe(msg);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    })
}

function refreshIframe(content) {
    // var iframe = document.getElementById('output');
    // iframe.contentWindow.document.open()
    // iframe.contentWindow.document.write(content);

    var iframe = document.createElement('iframe');
    iframe.id = 'otuput';
    iframe.height = '100%';
    iframe.width = '100%';
    iframe.style = 'border:none;';
    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(content);

    document.getElementById('out').appendChild(iframe);

    resolvePlaceHolders();
}

function resolvePlaceHolders() {
    // $('<div>' + globalcontent + '</div>').find('.resolve').each(function () {
    // $('.resolve').each(function () {
    var frame = $('#output').contents();
    frame.find('.resolve').each(function () {
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