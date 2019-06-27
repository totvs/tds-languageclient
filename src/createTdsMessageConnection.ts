import { spawn } from 'child_process';
import { MessageConnection, StreamMessageReader, StreamMessageWriter, createMessageConnection } from 'vscode-jsonrpc';
import languageServerBin from '@totvs/tds-ls';

export default function createTdsMessageConnection(args?: string[], options?: any): MessageConnection {
    let spawnArgs = ['--language-server'],
        spawnOptions = {
            env: process.env
        };

    if (Array.isArray(args)) {
        spawnArgs.push(...args);
    }

    if (options) {
        Object.assign(spawnOptions, options); 
    }

    let childProcess = spawn(languageServerBin, spawnArgs, spawnOptions);

    // Use stdin and stdout for communication:
    let connection = createMessageConnection(
        new StreamMessageReader(childProcess.stdout),
        new StreamMessageWriter(childProcess.stdin)
    );

    connection.listen();

    return connection;
}