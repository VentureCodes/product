import { S3ClientConfig, S3 } from '@aws-sdk/client-s3'

export const s3Client = new S3({
  endpoint: process?.env?.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
} as S3ClientConfig)
