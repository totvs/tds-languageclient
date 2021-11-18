import { spawn } from "child_process";
import {
  StreamMessageReader,
  StreamMessageWriter,
  createMessageConnection,
} from "vscode-jsonrpc";
import languageServerBin from "@totvs/tds-ls";
import { chmodSync } from "fs";
import { TdsMessageConnection } from "./types";

let instanceConnection: TdsMessageConnection = null;

export function createTdsMessageConnection(
  logging: boolean,
  args?: string[],
  options?: any
): TdsMessageConnection {
  if (instanceConnection != null) {
    return instanceConnection;
  }

  const spawnArgs = ["--language-server"],
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
      "--log-file=totvsls.log",
      "--log-file-append=totvsls_full.log",
      "--record=totvsls"
    );
  }

  if (options) {
    Object.assign(spawnOptions, options);
  }

  if (bin.match(/[\\\/]app\.asar[\\\/]/)) {
    bin = bin.replace(/([\\\/]app\.asar)([\\\/])/g, "$1.unpacked$2");
  }

  if (process.platform !== "win32") {
    chmodSync(bin, "0777");
  }

  const childProcess = spawn(bin, spawnArgs, spawnOptions);
  // Use stdin and stdout for communication:
  const connection = createMessageConnection(
    new StreamMessageReader(childProcess.stdout),
    new StreamMessageWriter(childProcess.stdin)
  );

  connection.listen();

  instanceConnection = connection as TdsMessageConnection;
  return instanceConnection;
}
