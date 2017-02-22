'use strict';
import * as vscode from 'vscode';
import Swagger from '@frecl/swagger';
import generateCode, {getOperationIdFromSwaggerObject, CreateFormattedJSXFromNJK} from "@frecl/codegen";

let configOptions : vscode.WorkspaceConfiguration = vscode
    .workspace
    .getConfiguration('frecl');
export function activate(context : vscode.ExtensionContext) {

    const disposable = vscode
        .commands
        .registerCommand('frecl.formGenerator', () => {

            // Check if there's a configuration
            if (!isConfigGood())
                return false;

            Swagger.loadURL(<string>configOptions.get('swaggerURL'))
                .then(swagger => {
                const postables = swagger
                    .getAllWithSchema()
                    .map(postable => postable.get("operationId"));
                const editor = vscode.window.activeTextEditor;
                vscode
                    .window
                    .showQuickPick(postables.toJS())
                    .then(selection => {

                        const renderedJSX = generateCode(swagger, getOperationIdFromSwaggerObject(selection), CreateFormattedJSXFromNJK("form.njk"));

                        editor.edit((editBuilder : vscode.TextEditorEdit) => {
                            editBuilder.insert(editor.selection.active, renderedJSX);
                        });

                    });
            }).catch(err => {
                vscode
                    .window
                    .showErrorMessage(err);
            });
        });

    context
        .subscriptions
        .push(disposable);

}

// Configuration Check
const isConfigGood = () => {
    console.log("swaggerURL", configOptions.get('swaggerURL'));
    if (configOptions.get('swaggerURL') === "" || !configOptions.has('swaggerURL')) {
        vscode
            .window
            .showErrorMessage("No FRECL configuration found for swaggerURL for this project. Go to Prefs->Workspace Settings.");
        return false;
    }

    return true;

};

// this method is called when your extension is deactivated
export function deactivate() {}

