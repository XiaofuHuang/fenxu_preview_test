var regex = /[?&]([^=#]+)=([^&#]*)/g;
var url = window.location.href;
var params = {};
var match;
while (match = regex.exec(url)) {
    params[match[1]] = match[2];
}

var depotName = params.depotname ? decodeURIComponent(params.depotname) : alert("Please append depot name in url!");
var originalContentGitUrl = params.originalcontentgiturl ? decodeURIComponent(params.originalcontentgiturl) : alert("Please append original content git url in url!");
var contgentGitUrl = params.contentgiturl ? decodeURIComponent(params.contentgiturl) : alert("Please append content git url in url!");
var contentOnlineUrl = params.contentonlineurl ? decodeURIComponent(params.contentonlineurl) : alert("Please append content online url in url!");

// TODO: support vso resource
var gitRepoUrlRegex = /^((https|http):\/\/(.+@)?github\.com\/|git@github\.com:)(\S+)\/([A-Za-z0-9_.-]+)(\.git)?\/blob\/(\S+?)\/(\S+)$/g;
var match = gitRepoUrlRegex.exec(originalContentGitUrl);
if (match == null) {
    alert("[Parameters Error]: original content git url is not correct!");
}
var gitRepoUrl = match[1] + match[4] + '/' + match[5] + '/';
var relativePath = match[8];
var branch = match[7];
var hostname = "https://op-build-sandbox2.azurewebsites.net/";
var token = "68271f67-4b4c-4c1a-b734-622516aa7193";
var isOnlinePreview = true;

$(document).ready(function () {
    $.ajax({
        url: hostname + 'content/?contentGitRepoUrl=' + originalContentGitUrl,
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        success: function (msg) {
            console.log('success: ' + msg);
            editor.doc.setValue(msg);
            sendPreviewRequest();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });

    $("#preview").click(sendPreviewRequest);

    $("#submit").click(sendSubmitRequest);
});

function sendPreviewRequest() {
    var markupRequest = {
        "markdown_content": document.getElementById("in").innerText.substr(1).replace(/\u200B/g, ''),
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
            console.log('success: ' + msg);
            callRender(msg);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    })
}

function sendSubmitRequest(){
    var pullRequestTitle = prompt("Enter title of this Pull Request : ", "pull request title here");

    var submitRequest = {
        "content_git_repo_url": contgentGitUrl,
        "content": document.getElementById("in").innerText.substr(1).replace(/\u200B/g, ''),
        "submit_type": "PullRequest",
        "pull_request_title": pullRequestTitle
    };

    $.ajax({
        type: "PUT",
        url: hostname + "submit",
        headers: {
            "Content-Type": "application/json",
            "X-OP-BuildUserToken": token
        },
        data: JSON.stringify(submitRequest),
        success: function (msg) {
            console.log('success: ' + msg);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    })
}

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
            console.log('success: ' + msg);
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

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./styles/css/resolve.css";

    doc.head.appendChild(script);
    doc.head.appendChild(link);

    var iframe = document.getElementById('output');
    iframe.contentWindow.document.open()
    iframe.contentWindow.document.write(doc.documentElement.innerHTML);
    iframe.contentWindow.document.close();
}
