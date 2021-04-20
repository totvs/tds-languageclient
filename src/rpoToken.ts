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
      const buffer: any = fs.readFileSync(path);
      const token: string = buffer.toString();
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

      result.token = token;
      result.header = headerJson;
      result.body = {
        ...bodyJson,
        exp: new Date(bodyJson.exp),
        iat: new Date(bodyJson.iat),
      };
    } catch (error) {
      result.error = error.message;
    }
  }

  return result;
}
