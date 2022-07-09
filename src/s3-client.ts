/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    GetObjectCommand,
    ListObjectsCommand,
    S3Client,
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

// getListOfObjects(token).then((data) => {
//     console.log('List of objects:', data?.Contents)
// })

// getSignedUrlForObject(
//     'ap-south-1:a933ef95-3753-4118-84c2-8f629a09b189/81a8MfMJimL._SX466_.jpg'
// ).then((url) => {
//     console.log('Signed URL:', url)
// })

export { getSignedUrlForObject, getListOfObjects }
