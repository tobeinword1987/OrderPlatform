import crypto from 'crypto';

export const hashdata = (data: string): string => {
    const hash = crypto.createHash('sha256');

    hash.update(data);

    const hexHash = hash.digest('hex');
    return hexHash;
  }
