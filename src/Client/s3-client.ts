/* eslint-disable @typescript-eslint/no-explicit-any */
import {
        DeleteObjectCommand,
        GetObjectCommand,
        ListObjectsCommand,
        PutObjectCommand,
        S3Client,
} from '@aws-sdk/client-s3'
import { CognitoIdentityCredentials } from '@aws-sdk/credential-provider-cognito-identity'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CONFIG } from '../config'
import { CognitoCredentials } from './cognito-client'

export class S3ClientManager {
        private client: S3Client
        private credentials: CognitoIdentityCredentials

        constructor() {
                this.client = {} as S3Client
                this.credentials = {} as CognitoIdentityCredentials
        }

        public async build(token: string) {
                await CognitoCredentials(token).then((credentials) => {
                        this.credentials = credentials
                        this.client = new S3Client({
                                region: CONFIG.S3_REGION as string,
                                credentials,
                        })
                })
        }
        public async getClient() {
                return this.client
        }
        public async getListOfObjects() {
                const ListOfObjects = await this.client.send(
                        new ListObjectsCommand({
                                Bucket: CONFIG.BUCKET_NAME,
                                Prefix: `${this.credentials?.identityId}/`,
                        })
                )
                return ListOfObjects
        }

        public async getSignedUrlForObject(objectKey: string) {
                const command = new GetObjectCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Key: objectKey,
                })

                const url = await getSignedUrl(this.client, command, {
                        expiresIn: 3600,
                })
                return url
        }

        public async createFolder(folderName: string) {
                const command = new PutObjectCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Key: folderName + '/',
                })

                await this.client.send(command)
        }

        public async uploadFile(
                file: any,
                filename: string,
                folderName: string
        ) {
                const command = new PutObjectCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Key:
                                //'ap-south-1:a933ef95-3753-4118-84c2-8f629a09b189' +
                                folderName + '/' + filename,
                        Body: file,
                })

                await this.client.send(command)
        }

        public async deleteFile(fileName: string) {
                const command = new DeleteObjectCommand({
                        Bucket: CONFIG.BUCKET_NAME,
                        Key: fileName,
                })

                await this.client.send(command)
        }
}
