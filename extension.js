// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// VSCODE: visualpython 설정
const path = require('path');
const $ = require('jquery');
// const indexHtml = require('./test/index');
// const test = require('./test/test');
// require("jquery-ui");
const fs = require('fs');
const { MenuProvider } = require('./MenuProvider');


global.__VP_CSS_LOADER__ = function(path) {
    return path + '.css';
}

global.__VP_TEXT_LOADER__ = function(path) {
    return '!!text-loader!' + path;
}

global.__VP_RAW_LOADER__ = function(path) {
    return path;
}

global.$ = $;
// global.vpBase = path.resolve(__dirname, "lib") + '/';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "visualpython-sample2" is now active!');

	// panel instance
	let currentPanel = undefined;

	let startPanel = vscode.commands.registerCommand('visualpython.start', (args) => {
		// Create and show a new webview
		const columnToShowIn = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.viewColumn
        : undefined;

		// const state = vscode.getState();
		// vscode.setState({ something: 0, ... });

		// context.extensionPath

		if (currentPanel) {
			// If we already have a panel, show it in the target column
			currentPanel.title = 'Visual Python [' + args?.toString() + ']';
			currentPanel.webview.html = getWebviewContent(currentPanel.webview, context, args);
			currentPanel.reveal(columnToShowIn);
		} else {
			currentPanel = vscode.window.createWebviewPanel(
			  'vpPanel', // Identifies the type of the webview. Used internally
			  'Visual Python [' + args?.toString() + ']', // Title of the panel displayed to the user
			  vscode.ViewColumn.Two, // Editor column to show the new webview panel in.
			  {
				enableScripts: true,
				retainContextWhenHidden: true, // works as browser tab (states saved and restored)
				// localResourceRoots: [vscode.Uri.file(context.extensionPath)] // set webview root
				// localResourceRoots: [context.extensionUri]
			  } // Webview options. More on these later.
			);
	
			// And set its HTML content
			currentPanel.webview.html = getWebviewContent(currentPanel.webview, context, args);
			// Open the frontend interface in the webview
            // let htmlFile = path.join(context.extensionPath, "html", "index.html");
            // let basePath = vscode.Uri.file(context.extensionPath).with({ scheme: 'vscode-resource' });
            // let htmlSource = fs.readFileSync(htmlFile, 'utf-8');
            // htmlSource = htmlSource.replace('<base href="">', '<base href="' + basePath.toString() + '/html/">');
            // currentPanel.webview.html = htmlSource;

	
			// on dispose
			currentPanel.onDidDispose(
				() => {
				  // Handle user closing panel before the 5sec have passed
				  console.log('Closed!');
				  currentPanel = null;
				},
				null,
				context.subscriptions
			);

			// Update contents based on view state changes
			currentPanel.onDidChangeViewState(
				e => {
					// 패널 상태 변경 시 참고용
					//   const panel = e.webviewPanel;
					//   panel.title = 'VIsual Python > ' + args?.toString();
					//   switch (panel.viewColumn) {
					// 	case vscode.ViewColumn.One:
					// 	  panel.title = 'Visual Python (One)';
					// 	  return;
			
					// 	case vscode.ViewColumn.Two:
					// 		panel.title = 'Visual Python (Two)';
					// 	  return;
			
					// 	case vscode.ViewColumn.Three:
					// 		panel.title = 'Visual Python (Three)';
					// 	  return;
					//   }
				},
				null,
				context.subscriptions
			);

			// Handle messages from the webview
			currentPanel.webview.onDidReceiveMessage(
				message => {
					console.log('received from webview: ' + message.command, message);
					switch (message.command) {
						case 'alert':
							vscode.window.showErrorMessage(message.text);
							return;
						case 'test':
							vscode.window.showInformationMessage(message.text);
							return;
						case 'addCell':
							if (vscode.window.activeNotebookEditor) {
								const { notebook, selection, selections, viewColumn } = vscode.window?.activeNotebookEditor;
								// vscode.commands.executeCommand('notebook.execute')
								// Focus notebook document
								vscode.window.showNotebookDocument(cellDocument, { viewColumn: viewColumn });

								const selectedIndex = selection.c || 0;
								const selectedCell = notebook.cellAt(selectedIndex);
								const cellDocument = selectedCell.document;
								const newCellIndex = selectedIndex + 1;

								// insert cell
								const edit = vscode.NotebookEdit.insertCells(newCellIndex, [
									new vscode.NotebookCellData(
										vscode.NotebookCellKind.Code,
										message.text,
										'python' // python / markdown
									)
								]);
								const wsEdit = new vscode.WorkspaceEdit();
								wsEdit.set(notebook.uri, [edit]);
								vscode.workspace.applyEdit(wsEdit); // 적용

								// focus container
								const insertedCell = notebook.cellAt(newCellIndex);
								vscode.commands.executeCommand('notebook.focusNextEditor', new vscode.NotebookRange(newCellIndex, newCellIndex + 1), insertedCell.notebook.uri);
							} else {
								if (vscode.window.visibleNotebookEditors) {
									const numOfVisibleNotebookEditors = vscode.window.visibleNotebookEditors.length;
									if (numOfVisibleNotebookEditors > 0) {
										vscode.window.showInformationMessage(numOfVisibleNotebookEditors + ' visible notebook editors available 😉');
										// get first visible notebook editor
										const { notebook, selection, selections, viewColumn } = vscode.window.visibleNotebookEditors[0];
										// console.log(notebook);
										// console.log(notebook.uri);
										const selectedIndex = selection.c || 0;
										const selectedCell = notebook.cellAt(selectedIndex);
										const cellDocument = selectedCell.document;
										// selection.c 
										// selection.e

										// Focus notebook document
										vscode.window.showNotebookDocument(cellDocument, { viewColumn: viewColumn });

										const newCellIndex = selectedIndex + 1;

										// insert cell
										const edit = vscode.NotebookEdit.insertCells(newCellIndex, [
											new vscode.NotebookCellData(
												vscode.NotebookCellKind.Code,
												message.text,
												'python' // python / markdown
											)
										]);
										const wsEdit = new vscode.WorkspaceEdit();
										wsEdit.set(notebook.uri, [edit]);
										vscode.workspace.applyEdit(wsEdit); // 적용

										// focus container
										const insertedCell = notebook.cellAt(newCellIndex);
										vscode.commands.executeCommand('notebook.focusNextEditor', new vscode.NotebookRange(newCellIndex, newCellIndex + 1), insertedCell.notebook.uri);
									} else {
										vscode.window.showErrorMessage('No visible notebook found... 🙄');
									}
								} else {
									vscode.window.showErrorMessage('No active notebook found... 🙄');
								}
							}
							return;
						case 'runCell':
							if (vscode.window.activeNotebookEditor) {
								const { notebook, selection, selections, viewColumn } = vscode.window?.activeNotebookEditor;
								// vscode.commands.executeCommand('notebook.execute')
								const selectedIndex = selection.c || 0;
								const selectedCell = notebook.cellAt(selectedIndex);
								const cellDocument = selectedCell.document;

								// Focus notebook document
								vscode.window.showNotebookDocument(cellDocument, { viewColumn: viewColumn });

								const newCellIndex = selectedIndex + 1;

								// insert cell
								const edit = vscode.NotebookEdit.insertCells(newCellIndex, [
									new vscode.NotebookCellData(
										vscode.NotebookCellKind.Code,
										message.text,
										'python' // python / markdown
									)
								]);
								const wsEdit = new vscode.WorkspaceEdit();
								wsEdit.set(notebook.uri, [edit]);
								vscode.workspace.applyEdit(wsEdit); // 적용

								// focus and execute selected cell
								const insertedCell = notebook.cellAt(newCellIndex);
								vscode.commands.executeCommand('notebook.cell.executeAndFocusContainer', new vscode.NotebookRange(newCellIndex, newCellIndex + 1), insertedCell.notebook.uri);
							} else {
								if (vscode.window.visibleNotebookEditors) {
									const numOfVisibleNotebookEditors = vscode.window.visibleNotebookEditors.length;
									if (numOfVisibleNotebookEditors > 0) {
										vscode.window.showInformationMessage(numOfVisibleNotebookEditors + ' visible notebook editors available 😉');
										// get first visible notebook editor
										const { notebook, selection, selections, viewColumn } = vscode.window.visibleNotebookEditors[0];
										// console.log(notebook);
										// console.log(notebook.uri);
										const selectedIndex = selection.c || 0;
										const selectedCell = notebook.cellAt(selectedIndex);
										const cellDocument = notebook.cellAt(selectedIndex).document;
										// selection.c 
										// selection.e

										// Focus notebook document
										vscode.window.showNotebookDocument(cellDocument, { viewColumn: viewColumn });

										// add cell and focus
										//vscode.commands.executeCommand('notebook.cell.insertCodeCellBelowAndFocusContainer');

										const newCellIndex = selectedIndex + 1;

										// TODO: change cell value
										// vscode.NotebookEdit.replaceCells(
										// 	new vscode.NotebookRange(index, index + 1),
										// 	[]
										// )

										// insert cell
										const edit = vscode.NotebookEdit.insertCells(newCellIndex, [
											new vscode.NotebookCellData(
												vscode.NotebookCellKind.Code,
												message.text,
												'python' // python / markdown
											)
										]);

										const wsEdit = new vscode.WorkspaceEdit();
										wsEdit.set(notebook.uri, [edit]);
										vscode.workspace.applyEdit(wsEdit); // 적용

										const insertedCell = notebook.cellAt(newCellIndex);
										// insertedCell.document.focus();

										// execute selected cell
										// vscode.commands.executeCommand('notebook.cell.execute', [newCellIndex]);
										vscode.commands.executeCommand('notebook.cell.executeAndFocusContainer', new vscode.NotebookRange(newCellIndex, newCellIndex + 1), insertedCell.notebook.uri);

										// console.log(vscode.commands.getCommands().then(function(result) {
										// 	console.log(result.toString());
										// }));
										//commands: editor.action.insertLineAfter
										
										// notebook.cellAt(_) // position number?
										// notebook.cellCount
										// notebook.getCells(_) // 
										// notebook.notebooktype // jupyter-notebook
										// notebook.save()
										// notebook.uri.fsPath
									} else {
										vscode.window.showErrorMessage('No visible notebook found... 🙄');
									}
								} else {
									vscode.window.showErrorMessage('No active notebook found... 🙄');
								}
							}
							return;
						case 'getOutput':
							const editor = getCurrentNotebook();
							if (editor) {
								const { notebook, selection, selections, viewColumn } = editor;
								const selectedIndex = selection.c || 0;
								const selectedCell = notebook.cellAt(selectedIndex);
								const cellDocument = selectedCell.document;
								let output = [];
								if (selectedCell && selectedCell.outputs) {
									output = selectedCell.outputs[0]?.items?.map(item => item?.data?.toString() || '') || [];
								}
								currentPanel.webview.postMessage({ command: 'result', result: 'Cell output: ' + output.join('/') });
							} else {
								vscode.window.showErrorMessage('No active notebook found... 🙄');
							}
							return;
						case 'execute':
							// getCurrentKernel().then((kernel) => {
							// 	console.log(kernel, message.code);
							// })
							const vpNotebook = vscode.notebooks.createNotebookController(
								'vp-kernel',
								'jupyter-notebook',
								'VP Notebook'
							);
							vpNotebook.supportedLanguages = ['python'];
							vpNotebook.supportsExecutionOrder = true;
							// vpNotebook.executeHandler = this._execute.bind(this);
							return;
					}
				},
				undefined,
				context.subscriptions
			);

		}
	});
	context.subscriptions.push(startPanel);

	// Our new command
	context.subscriptions.push(
		vscode.commands.registerCommand('visualpython.sendCmd', () => {
		  if (!currentPanel) {
			return;
		  }
	
		  // Send a message to our webview.
		  // You can send any JSON serializable data.
		  currentPanel.webview.postMessage({ command: 'refactor', message: 'test' });
		})
	);

	// tree view
	// const rootPath =
	// 	vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
	// 		? vscode.workspace.workspaceFolders[0].uri.fsPath
	// 		: undefined;
	const menuProvider = new MenuProvider(context.extensionPath);
	// vscode.window.registerTreeDataProvider('vp-menu', menuProvider);
	vscode.window.createTreeView('vp-menu', {
		treeDataProvider: menuProvider
	});
	context.subscriptions.push(
		vscode.commands.registerCommand('visualpython.refreshMenu', () =>
			menuProvider.refresh()
		)
	);
	// Notebook commands
	context.subscriptions.push(
		vscode.commands.registerCommand('visualpython.clearOutput', () =>
			vscode.commands.executeCommand('notebook.clearAllCellsOutputs')
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('visualpython.executeAll', () =>
			vscode.commands.executeCommand('notebook.execute')
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('visualpython.executeCell', () =>
			vscode.commands.executeCommand('notebook.cell.executeAndFocusContainer', [0])
		)
	);
}

// this method is called when your extension is deactivated
function deactivate() {
	
}

/**
 * Search notebook for document
 * @param {*} document : vscode.NotebookDocument
 * @returns Promise<NotebookEditor | undefined>
 */
async function getDocumentNotebook(document)  {
    const editor = [...vscode.window.visibleNotebookEditors, vscode.window.activeNotebookEditor].find(editor => editor?.document.uri.toString() === document.uri.toString());
    if (editor) {
		// editor.kernel = NotebookEditor
      	return (editor).resolve();
    }
}

/**
 * 
 * @param {*} document : vscode.NotebookDocument
 * @returns Promise<IRunningKernel | undefined>
 */
function getCurrentNotebook()  {
    const editors = [...vscode.window.visibleNotebookEditors, vscode.window.activeNotebookEditor];
    if (editors && editors.length > 0) {
      	return editors[0];
    }
	return null;
}

/**
 * 
 * @param {*} document : vscode.NotebookDocument
 * @returns Promise<IRunningKernel | undefined>
 */
async function getCurrentKernel()  {
    const editors = [...vscode.window.visibleNotebookEditors, vscode.window.activeNotebookEditor];
	
    if (editors && editors.length > 0) {
		// editor.kernel = NotebookKernel
      	return (editors[0]?.kernel).resolve();
    }
	return null;
}

/**
 * 
 * @param {*} document : vscode.NotebookDocument
 * @returns Promise<IRunningKernel | undefined>
 */
async function getDocumentKernel(document)  {
    const editor = [...vscode.window.visibleNotebookEditors, vscode.window.activeNotebookEditor].find(editor => editor?.document.uri.toString() === document.uri.toString());
    if (editor) {
		// editor.kernel = NotebookKernel
      	return (editor.kernel).resolve();
    }
}

function getWebviewContent(webview, context, args) {

	const extensionUri = context.extensionUri;
	const extensionPath = context.extensionPath;

	// Get resource paths
	const jqueryUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'visualpython', 'lib', 'jquery', 'jquery-3.6.0.min.js'));
	const requireUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'visualpython', 'lib', 'require', 'require.js'));
	const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'visualpython', 'css', 'root.css'));
	const requireMainUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'main.js'));

	console.log('Extension Uri: ' + extensionUri);
	console.log('Extension Path: ' + extensionPath);

	return `<!DOCTYPE html>
	<head>
	<script>
		window.vpBase = '${extensionUri}';
		window.vpBasePath = '${extensionPath}';
		window.vpInfo = {
			base: '${extensionUri}',
			selectedApp: '${args?.toString() || 'Unknown'}'
		}
	</script>
	<script src="${jqueryUri}"></script>
	<script src="${requireUri}" data-main="${requireMainUri}"></script>
	<link rel="stylesheet" type="text/css" href="${styleUri}" />
	</head>
	<body>
	<div style="display: flex; justify-content: flex-end; gap: 5px;">
		<button class="vp-button" id="sendCmd">Send Message</button>
		<button class="vp-button" id="addCell">Add Cell</button>
		<button class="vp-button" id="runCell">Add and Run Cell</button>
		<button class="vp-button" id="getOutput">Get output</button>
		<button class="vp-button" id="execute" style="display: none;">Execute</button>
	</div>
	<div>${args?.toString() || 'None'}</div>
	<input id="testText" type="text" />
	<div id="refactor">initial state</div>
	<div id="result">Result</div>
	<div></div>
	<script>
		window.vpBase = '${extensionUri}';
		// window.acquireVsCodeApi = global.acquireVsCodeApi; // global 없음 오류 뜸
		window.vscode = acquireVsCodeApi();
		$(function() {
			// 시작점
			// Handle the message inside the webview
			window.addEventListener('message', event => {
				const message = event.data; // The JSON data our extension sent

				switch (message.command) {
					case 'result':
						$('#result').html(message.result);
						break;
				}
			});
		})
	</script>
	</body>
	</html>`
}

// eslint-disable-next-line no-undef
module.exports = {
	activate,
	deactivate
}