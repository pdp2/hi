export const REMOTE_HOST = 'paoloweb.dev';

export default function (host) {
  if (typeof host === 'string' && host.includes(REMOTE_HOST)) {
    return false;
  }
  
  return true;
}