import { S3Client } from "@aws-sdk/client-s3";

export const s3client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "local",
    forcePathStyle: true,
});
