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

*/
