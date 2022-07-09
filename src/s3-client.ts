/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListObjectsCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '../node_modules/@aws-sdk/client-s3/dist-types/commands/GetObjectCommand'
import { CognitoCredentials } from './cognito-client'
import { CONFIG } from './config'

let credentials: any

async function loadCognitoCredentials() {
    credentials = await CognitoCredentials()
    console.log('Cognito Credentials:', credentials)
    return credentials
}

loadCognitoCredentials()

const s3Client = new S3Client({
    region: CONFIG.S3_REGION,
    credentials: credentials,
})

async function getListOfObjects() {
    credentials = await CognitoCredentials()

    const ListOfObjects = await s3Client.send(
        new ListObjectsCommand({
            Bucket: CONFIG.BUCKET_NAME,
            Prefix: `${credentials?.identityId}/`,
        })
    )
    return ListOfObjects
}

async function getSignedUrlForObject(objectKey: string): Promise<string> {
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

getListOfObjects().then((data) => {
    console.log('List of objects:', data)
})
