export const REMOTE_HOST = 'pdp2.github.io';

export default function (host) {
  if (typeof host === 'string' && host.includes(REMOTE_HOST)) {
    return false;
  }
  
  return true;
}