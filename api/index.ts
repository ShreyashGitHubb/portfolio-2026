// @ts-ignore
import server from '../dist/server/server.js';

export default async function handler(req: Request): Promise<Response> {
  return server.fetch(req);
}
