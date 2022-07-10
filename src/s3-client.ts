/* eslint-disable @typescript-eslint/no-explicit-any */
import {
        GetObjectCommand,
        ListObjectsCommand,
        S3Client,
        PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CognitoCredentials } from './cognito-client'
import { CONFIG } from './config'

let credentials: any

async function getListOfObjects(token: string) {
        const s3Client = new S3Client({
                region: CONFIG.S3_REGION,
                credentials: credentials,
        })

        credentials = await CognitoCredentials(token)

        const ListOfObjects = await s3Client.send(
                new ListObjectsCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Prefix: `${credentials?.identityId}/`,
                })
        )
        return ListOfObjects
}

async function getSignedUrlForObject(
        token: string,
        objectKey: string
): Promise<string> {
        credentials = await CognitoCredentials(token)

        const s3Client = new S3Client({
                region: CONFIG.S3_REGION,
                credentials,
        })

        const command = new GetObjectCommand({
                Bucket: CONFIG.BUCKET_NAME,
                Key: objectKey,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        return url
}

async function createFolder(token: string, folderName: string) {
        credentials = await CognitoCredentials(token)

        const s3Client = new S3Client({
                region: CONFIG.S3_REGION,
                credentials,
        })

        await s3Client.send(
                new PutObjectCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Key: folderName + '/',
                })
        )
}

export { getSignedUrlForObject, getListOfObjects }
