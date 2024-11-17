// src/extension.ts
import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

const localize = nls.loadMessageBundle();

export function activate(context: vscode.ExtensionContext) {

    // コマンド①：開いているすべてのファイルをコピー
    let disposableAll = vscode.commands.registerCommand('codeclip.copyAllOpenFiles', async () => {
        let content = '';

        // すべてのタブを取得
        const allTabs = vscode.window.tabGroups.all.flatMap(group => group.tabs);

        // テキストファイルのタブのみを抽出
        const textTabs = allTabs.filter(tab => tab.input instanceof vscode.TabInputText);

        if (textTabs.length === 0) {
            vscode.window.showInformationMessage(localize('noOpenTextEditors', 'There are no open text editors.'));
            return;
        }

        for (const tab of textTabs) {
            const input = tab.input as vscode.TabInputText;
            const document = await vscode.workspace.openTextDocument(input.uri);
            const filePath = vscode.workspace.asRelativePath(document.fileName);
            const fileContent = document.getText();

            content += '```' + filePath + '\n' + fileContent + '\n```\n\n';
        }

        // クリップボードにコピー
        await vscode.env.clipboard.writeText(content.trim());
        vscode.window.showInformationMessage(localize('copiedAllFiles', 'Copied all open files to clipboard.'));
    });

    // コマンド②：アクティブなファイルをコピー
    let disposableActive = vscode.commands.registerCommand('codeclip.copyActiveFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage(localize('noActiveEditor', 'There is no active editor.'));
            return;
        }

        const document = editor.document;
        const filePath = vscode.workspace.asRelativePath(document.fileName);
        const fileContent = document.getText();

        const content = '```' + filePath + '\n' + fileContent + '\n```';

        // クリップボードにコピー
        await vscode.env.clipboard.writeText(content);
        vscode.window.showInformationMessage(localize('copiedActiveFile', 'Copied active file to clipboard.'));
    });

    context.subscriptions.push(disposableAll);
    context.subscriptions.push(disposableActive);
}

export function deactivate() {}
