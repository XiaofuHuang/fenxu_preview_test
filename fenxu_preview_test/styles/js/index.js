// TODO: hard code reolve
var depotName = "MSDN.fenxu_preview_test_ppe";
var gitRepoUrl = "https://github.com/fenxuorg/fenxu_preview_test_ppe/";
var relativePath = "fenxu_preview_test_ppe/sample.md";
var hostname = "https://op-build-sandbox2.azurewebsites.net/";
var token = "3a7b682a-1040-4228-98e9-4dbce74938a5"
var isOnlinePreview = true;
var branch = "master";

$(document).ready(function () {
    $("button").click(function () {
        var markupRequest = {
            "markdown_content": document.getElementById("in").innerText.replace(/\u200B/g, ''),
            "repository_url": gitRepoUrl,
            "branch": branch,
            "relative_path": relativePath,
            "depot_name": depotName
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
            "fileRelativePath": relativePath,
        },
        "themesRelativePathToOutputRoot": "_themes/"
    }

    var renderRequest = {
        "html_content": JSON.stringify(rawJson),
        "is_online_preview": isOnlinePreview,
        "repository_url": gitRepoUrl,
        "branch": branch,
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
    script.src = "./styles/js/resolve.js";
    doc.head.appendChild(script);

    var iframe = document.getElementById('output');
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(doc.documentElement.innerHTML);
    iframe.contentWindow.document.close(); 
}
