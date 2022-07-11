/* eslint-disable @typescript-eslint/no-explicit-any */
import {
        GetObjectCommand,
        ListObjectsCommand,
        PutObjectCommand,
        S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { CognitoCredentials } from './cognito-client'
import { CONFIG } from '../config'

export class S3ClientManager {
        private client: any
        private credentials: any

        constructor() {
                this.client = null
                this.credentials = null
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
}
