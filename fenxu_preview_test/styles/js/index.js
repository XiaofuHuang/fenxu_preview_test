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
var token = "4d0e8306-5023-46e1-8364-2cc1a2a96cc1"
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
    var doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = content;

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://ppe.docs.microsoft.com/en-us/fenxu_preview_test/styles/js/resolve.js?branch=jiayin";
    doc.head.appendChild(script);

    var iframe = document.getElementById('output');
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(doc.documentElement.innerHTML);
    iframe.contentWindow.document.close(); 
}
