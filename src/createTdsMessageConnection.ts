import { spawn } from 'child_process';
import { MessageConnection, StreamMessageReader, StreamMessageWriter, createMessageConnection } from 'vscode-jsonrpc';
import languageServerBin from '@totvs/tds-ls';
import { chmodSync } from 'fs';

export default function createTdsMessageConnection(args?: string[], options?: any): MessageConnection {
    let spawnArgs = ['--language-server'],
        spawnOptions = {
            env: process.env
        },
        bin = languageServerBin;

    if (Array.isArray(args)) {
        spawnArgs.push(...args);
    }

    if (options) {
        Object.assign(spawnOptions, options);
    }

    if (bin.match(/[\\\/]app\.asar[\\\/]/)) {
        bin = bin.replace(/([\\\/]app\.asar)([\\\/])/g, '$1.unpacked$2');
    }

    if (process.platform !== 'win32') {
        chmodSync(bin, '0777');
    }

    let childProcess = spawn(bin, spawnArgs, spawnOptions);

    // Use stdin and stdout for communication:
    let connection = createMessageConnection(
        new StreamMessageReader(childProcess.stdout),
        new StreamMessageWriter(childProcess.stdin)
    );

    connection.listen();

    return connection;
}