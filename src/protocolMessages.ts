/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */
/* ************************************************************ */

/*



export function sendGetUsersRequest(server: ServerItem): Thenable<any> {
  return languageClient
    .sendRequest('$totvsmonitor/getUsers', {
      getUsersInfo: {
        connectionToken: server.token,
      },
    })
    .then(
      (response: any) => {
        return response.mntUsers;
      },
      (err: Error) => {
        languageClient.error(err.message, err);
      }
    );
}

export function sendLockServer(
  server: ServerItem,
  lock: boolean
): Thenable<boolean> {
  return languageClient
    .sendRequest('$totvsmonitor/setConnectionStatus', {
      setConnectionStatusInfo: {
        connectionToken: server.token,
        status: !lock, //false: conexões bloqueadas
      },
    })
    .then((response: any) => {
      return response.message === 'OK';
    });
}

export function sendIsLockServer(server: ServerItem): Thenable<boolean> {
  return languageClient
    .sendRequest('$totvsmonitor/getConnectionStatus', {
      getConnectionStatusInfo: {
        connectionToken: server.token,
      },
    })
    .then((response: any) => {
      return !response.status; //false: conexões bloqueadas
    });
}

export function sendKillConnection(
  server: ServerItem,
  target: any
): Thenable<string> {
  return languageClient
    .sendRequest('$totvsmonitor/killUser', {
      killUserInfo: {
        connectionToken: server.token,
        userName: target.username,
        computerName: target.computerName,
        threadId: target.threadId,
        serverName: target.server,
      },
    })
    .then(
      (response: any) => {
        return response.message;
      },
      (error: Error) => {
        return error.message;
      }
    );
}

export function sendStopServer(server: ServerItem): Thenable<string> {
  return languageClient
    .sendRequest('$totvsserver/stopServer', {
      stopServerInfo: {
        connectionToken: server.token,
      },
    })
    .then(
      (response: any) => {
        return response.message;
      },
      (error: Error) => {
        return error;
      }
    );
}

export function sendUserMessage(
  server: ServerItem,
  target: any,
  message: string
): Thenable<string> {
  return languageClient
    .sendRequest('$totvsmonitor/sendUserMessage', {
      sendUserMessageInfo: {
        connectionToken: server.token,
        userName: target.username,
        computerName: target.computerName,
        threadId: target.threadId,
        server: target.server,
        environment: target.environment,
        message: message,
      },
    })
    .then(
      (response: any) => {
        return response.message;
      },
      (error: Error) => {
        return error.message;
      }
    );
}

export function sendAppKillConnection(
  server: ServerItem,
  target: any
): Thenable<string> {
  return languageClient
    .sendRequest('$totvsmonitor/appKillUser', {
      appKillUserInfo: {
        connectionToken: server.token,
        userName: target.username,
        computerName: target.computerName,
        threadId: target.threadId,
        serverName: target.server,
      },
    })
    .then(
      (response: any) => {
        return response.message;
      },
      (error: Error) => {
        return error.message;
      }
    );
}



export function sendRpoInfo(server: ServerItem): Thenable<RpoInfoResult> {
  if (_debugEvent) {
    vscode.window.showWarningMessage(
      'Esta operação não é permitida durante uma depuração.'
    );
    return;
  }
  return languageClient
    .sendRequest('$totvsserver/rpoInfo', {
      rpoInfo: {
        connectionToken: server.token,
        environment: server.environment,
      },
    })
    .then((response: RpoInfoResult) => {
      return response;
    });
}

export function sendApplyPatchRequest(
  server: ServerItem,
  patchUri: string,
  permissions,
  applyScope: IApplyScope
): Thenable<IPatchValidateResult> {
  return languageClient
    .sendRequest('$totvsserver/patchApply', {
      patchApplyInfo: {
        connectionToken: server.token,
        authenticateToken: permissions.authorizationToken,
        environment: server.environment,
        patchUri: patchUri,
        isLocal: true,
        applyScope: applyScope,
        isValidOnly: false,
      },
    })
    .then(
      (response: IPatchValidateResult) => {
        if (response.error) {
          return Promise.reject(response);
        }

        return Promise.resolve(response);
      },
      (err: ResponseError<object>) => {
        const error: IPatchValidateResult = {
          error: true,
          message: err.message,
          //     patchValidates: err.data,
          errorCode: err.code,
        };

        return Promise.reject(error);
      }
    );
}

export function sendValidPatchRequest(
  server: ServerItem,
  patchUri: string,
  permissions,
  applyScope: string
): Thenable<IPatchValidateResult> {
  return languageClient
    .sendRequest('$totvsserver/patchApply', {
      patchApplyInfo: {
        connectionToken: server.token,
        authenticateToken: permissions.authorizationToken,
        environment: server.environment,
        patchUri: patchUri,
        isLocal: true,
        applyScope: applyScope,
        isValidOnly: true,
      },
    })
    .then(
      (response: IPatchValidateResult) => {
        return response.error
          ? Promise.reject(response)
          : Promise.resolve(response);
      },
      (err: ResponseError<object>) => {
        const result: IPatchValidateResult = {
          error: true,
          message: err.message,
          patchValidates: [],
          errorCode: PATCH_ERROR_CODE.GENERIC_ERROR,
        };

        return Promise.reject(result);
      }
    );
}

export function sendPatchInfo(
  server: ServerItem,
  permissions,
  patchUri: string
): Thenable<any> {
  if (_debugEvent) {
    vscode.window.showWarningMessage(
      'Esta operação não é permitida durante uma depuração.'
    );
    return Promise.resolve();
  }

  return languageClient
    .sendRequest('$totvsserver/patchInfo', {
      patchInfoInfo: {
        connectionToken: server.token,
        authorizationToken: permissions.authorizationToken,
        environment: server.environment,
        patchUri: patchUri,
        isLocal: true,
      },
    })
    .then(
      (response: any) => {
        return response.patchInfos;
      },
      (err: ResponseError<object>) => {
        vscode.window.showErrorMessage(err.message);
      }
    );
}

export interface IApplyTemplateResult {
  error: boolean;
  message: string;
  errorCode: number;
}

export function sendApplyTemplateRequest(
  server: ServerItem,
  includesUris: Array<string>,
  templateUri: vscode.Uri
): Thenable<IApplyTemplateResult> {
  return languageClient
    .sendRequest('$totvsserver/templateApply', {
      templateApplyInfo: {
        connectionToken: server.token,
        authorizationToken: '',
        environment: server.environment,
        includeUris: includesUris,
        templateUri: templateUri.toString(),
        isLocal: true,
      },
    })
    .then(
      (response: IApplyTemplateResult) => {
        if (response.error) {
          return Promise.reject(response);
        }
        return Promise.resolve(response);
      },
      (err: ResponseError<object>) => {
        const error: IApplyTemplateResult = {
          error: true,
          message: err.message,
          errorCode: err.code,
        };
        return Promise.reject(error);
      }
    );
}

interface IRpoTokenResult {
  sucess: boolean;
  message: string;
}

export function sendRpoToken(
  server: ServerItem,
  rpoToken: IRpoToken
): Thenable<IRpoTokenResult> {
  if (rpoToken.file === '') {
    return Promise.resolve({ sucess: false, message: '' });
  }

  return languageClient
    .sendRequest('$totvsserver/rpoToken', {
      rpoToken: {
        connectionToken: server.token,
        environment: server.environment,
        file: rpoToken.file,
        content: rpoToken.token,
      },
    })
    .then(
      (response: IRpoTokenResult) => {
        return response;
      },
      (err: ResponseError<object>) => {
        return { sucess: false, message: err.message };
      }
    );
}
*/
