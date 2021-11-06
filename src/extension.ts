// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "console-flash" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("flash.log", async () => {
    // The code you place here will be executed every time your command is executed
    const editor = vscode.window.activeTextEditor;

    if (!editor) return;

    const quote = vscode.workspace.getConfiguration("console-flash").get("double-quotes") ? '"' : "'";
    const semiColon = vscode.workspace.getConfiguration("console-flash").get("semi-colon") ? ";" : "";

    if (editor.selection.isEmpty) {
      const position = editor.selection.active;

      const textContent = editor.document.getText();

      const currentLine = textContent.split("\n")[position.line];

      if (currentLine.trim()) {
        await vscode.commands.executeCommand("editor.action.insertLineAfter");
      }

      const valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
      const index = position.character;

      function findNext(original: string, final: string, i: number, change: -1 | 1): string {
        if (typeof original[i] === "undefined") return final;
        if (!valid.includes(original[i])) return final;

        return findNext(original, final + original[i], i + change, change);
      }

      if (!valid.includes(currentLine[index])) {
        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, `console.log()${semiColon}`);
        });
      } else {
        const left = findNext(currentLine.slice(0, index), "", index - 1, -1)
          .split("")
          .reverse()
          .join("");
        const right = findNext(currentLine.slice(index + 1), "", 0, 1);
        const result = `${left}${currentLine[index]}${right}`;

        editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.active, `console.log(${quote}${result}: ${quote}, ${result})${semiColon}`);
        });
      }
    } else {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      await vscode.commands.executeCommand("editor.action.insertLineAfter");

      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, `console.log(${quote}${text}: ${quote}, ${text})${semiColon}`);
      });
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
