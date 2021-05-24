/*
Copyright 2021 TOTVS S.A

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http: //www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import * as fs from 'fs';
import { IRpoToken } from './types';

const noRpoToken: IRpoToken = {
  file: '',
  token: '',
  header: {
    alg: '',
    typ: '',
  },
  body: {
    auth: '',
    exp: new Date(0),
    iat: new Date(0),
    iss: '',
    name: '',
    sub: '',
  },
  error: '',
  warning: '',
};

export function getRpoTokenFromFile(path: string): IRpoToken {
  let result: IRpoToken = noRpoToken;

  if (path) {
    try {
      const buffer: Buffer = fs.readFileSync(path);
      const token: string = buffer.toString();

      result = getRpoTokenFromString(token);
      result.file = path;
    } catch (error) {
      result.error = error.message;
    }
  }

  return result;
}

export function getRpoTokenFromString(token: string): IRpoToken {
  const result: IRpoToken = noRpoToken;

  try {
    const content: string = Buffer.from(token, 'base64').toString('ascii');

    const header: string = content.substring(
      content.indexOf('{'),
      content.indexOf('}') + 1
    );
    let body: string = content.substring(header.length);
    body = content.substring(
      header.length,
      header.length + body.indexOf('}') + 1
    );

    const headerJson: any = JSON.parse(header);
    const bodyJson: any = JSON.parse(body);

    result.token = content;
    result.header = headerJson;
    result.body = {
      ...bodyJson,
      exp: new Date(bodyJson.exp),
      iat: new Date(bodyJson.iat),
    };
  } catch (error) {
    result.error = error.message;
  }

  return result;
}
