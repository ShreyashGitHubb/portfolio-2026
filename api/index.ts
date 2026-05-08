// @ts-ignore
import server from '../dist/server/server.js';

export default async function handler(req: any, res: any) {
  // If req is a Node IncomingMessage (relative URL)
  if (!req.url?.startsWith('http')) {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const fullUrl = new URL(req.url || '/', `${protocol}://${host}`);

    const init: RequestInit = {
      method: req.method,
      headers: req.headers as any,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const { Readable } = await import('stream');
      init.body = Readable.toWeb(req) as any;
      // @ts-ignore
      init.duplex = 'half';
    }

    const request = new Request(fullUrl.href, init);
    const response = await server.fetch(request);

    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    if (response.body) {
      const { Readable } = await import('stream');
      const readable = Readable.fromWeb(response.body as any);
      readable.pipe(res);
    } else {
      res.end();
    }
    return;
  }

  // If Vercel provided a native Web Request
  return server.fetch(req);
}
