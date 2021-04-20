import { spawn } from 'child_process';
import { StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc';
import languageServerBin from '@totvs/tds-ls';
import { chmodSync } from 'fs';
import { IMessageConnection } from './types';

export function createMessageConnection(
  logging: boolean,
  args?: string[],
  options?: any
): IMessageConnection {
  const spawnArgs = ['--language-server'],
    spawnOptions = {
      env: process.env,
    };
  let bin = languageServerBin;

  if (Array.isArray(args)) {
    spawnArgs.push(...args);
  }

  // activate logging
  if (logging) {
    spawnArgs.push(
      '--log-file=totvsls.log',
      '--log-file-append=totvsls_full.log',
      '--record=totvsls'
    );
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

  const childProcess = spawn(bin, spawnArgs, spawnOptions);

  // Use stdin and stdout for communication:
  const connection = createMessageConnection(
    new StreamMessageReader(childProcess.stdout),
    new StreamMessageWriter(childProcess.stdin)
  );

  connection.listen();

  return connection as IMessageConnection;
}
