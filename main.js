console.log('vpBase is ===> ' + vpBase);
console.log('vpBasePath is ===> ' + vpBasePath);

window.__VP_CSS_LOADER__ = function(path) {
    return 'css!' + path + '.css';
}

window.__VP_TEXT_LOADER__ = function(path) {
    return 'text!' + path + '!strip';
}

window.__VP_RAW_LOADER__ = function(path) {
    return 'text!' + path;
}

require.config({
    // baseUrl: '..',
    paths:{
        'vp_base'   : 'visualpython',
        'text'      : 'visualpython/lib/require/text',
        'css'       : 'visualpython/lib/require/css.min',
        'jquery'    : 'visualpython/lib/jquery/jquery-3.6.0.min',
        'jquery-ui' : 'visualpython/lib/jquery/jquery-ui.min',
        'codemirror': 'visualpython/lib/codemirror',
        'marked'    : 'visualpython/lib/marked/marked',
        'mathjaxutils'   : 'visualpython/lib/mathjax/mathjaxutils',
        //'fontawesome'    : 'lib/fontawesome/fontawesome.min'
    },
    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        }
    },
    config: {
        text: {
            // allow CORS        
            useXhr: function(url, protocol, hostname, port) {
                // console.log('allow xhr');
                return true;
            },
            onXhr: function(xhr, url) {
                // console.log(xhr);
            }
        }
    },
    map: {
        '*': {
            css :  'visualpython/lib/require/css.min'
        }
    },
    packages: [{
        name: "codemirror",
        location: "visualpython/lib/codemirror/",
        main: "visualpython/lib/codemirror"
    }]
});
define([
    'text', 
    'css', 
    'jquery', 
    'jquery-ui',
	'codemirror/lib/codemirror', 
	// 'vp_base/lib/codemirror/lib/codemirror.css', // INTEGRATION: unified version of css loader 
    'vp_base/js/loadVisualpython',
	'vp_base/js/com/com_Config'
    // 'text!vp_base/html/mainFrame.html', // text loader test
    // 'css!vp_base/css/root.css'          // css loader test
], function(
    text, css, $, ui, codemirror, 
    // cmCss, 
    loadVisualpython, com_Config
    // mainFrameHtml, rootCss
) {
// ], function(test) {

    console.log('hi there');
    console.log('inside define : ', vscode);

    // Load mainFrame
    vpInfo.mainFrame = loadVisualpython.initVisualpython();
    window.vpExtType = 'vscode';

    // Change kernel & interface actions depends on vpExtType
    // * tag VSCODE: 

    $('#refactor').html('yes');

    $('#refactor').html('ready');
    $('#testText').val("print('# Visual Python > " + vpInfo?.selectedApp + "')");
    $('#sendCmd').on('click', function() {
        const text = $('#testText').val();
        $('#refactor').html(text);
        vscode.postMessage({
            command: 'test',
            text: text + ' from ' + vpInfo?.selectedApp
        });
        // const textVal = $('#testText').val();
        // test.sendCmd(textVal + ' from ' + vpInfo?.selectedApp);
    });

    $('#addCell').on('click', function() {
        const code = $('#testText').val();
        vscode.postMessage({
            command: 'addCell',
            text: code
        });
    });

    $('#runCell').on('click', function() {
        const code = $('#testText').val();
        vscode.postMessage({
            command: 'runCell',
            text: code
        });
    });

    $('#getOutput').on('click', function() {
        const code = $('#testText').val();
        vscode.postMessage({
            command: 'getOutput',
            text: code
        });
    });

    $('#execute').on('click', function() {
        const code = $('#testText').val();
        vscode.postMessage({
            command: 'execute',
            text: code
        });
    });
})