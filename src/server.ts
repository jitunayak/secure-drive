/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONFIG } from './config'
import Express, { Request, Response } from 'express'

import { authorize, getBearerToken } from './Helper/authentication'
import Redis from 'ioredis'
import { S3ClientManager } from './Client/s3-client'
import { BuildFileDetail } from './Builder/builder'
import { getFolderName } from './Helper/Helper'

console.log('Running Envrionemt:', CONFIG.ENV)
const PORT = CONFIG.PORT

const redis = new Redis({
        host: CONFIG.REDIS_HOST,
        port: CONFIG.REDIS_PORT,
        password: CONFIG.REDIS_PASSWORD,
})

const app = Express()
app.use(Express.json())

app.get('/', (req, res) => {
        res.send('Secure Drive Server is running')
})

app.get('/files', authorize, async (req: Request, res: Response) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const listOfObjects = await s3ClientManager.getListOfObjects()
                const files = listOfObjects.Contents.map(
                        async (object: any) => {
                                return BuildFileDetail(s3ClientManager, object)
                        }
                )

                Promise.all(files).then((files) => {
                        res.status(200).send(files)
                })
        } catch (e: any) {
                res.status(500).send(e?.message)
        }
})

app.post(
        '/folder/passcheck',
        authorize,
        async (req: Request, res: Response) => {
                try {
                        const { passcode, folderName } = req.body
                        const dbPassword = await redis.get(
                                folderName + '-vault'
                        )
                        if (passcode === dbPassword) {
                                return res.status(200).send('Granted')
                        }
                        return res.status(401).send('Unauthorized')
                } catch (e: any) {
                        return res.status(500).send(e?.message)
                }
        }
)

app.post('/folder', authorize, async (req: Request, res: Response) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const { passcode, folderName } = req.body
                const dbFolderName = folderName + '-vault'
                const dbPassword = await redis.set(dbFolderName, passcode)

                if (dbPassword === 'OK') {
                        await s3ClientManager.createFolder(dbFolderName)
                        return res.status(201).send('Secure Folder Created')
                }
                return res.status(500).send('Failed to create secure folder')
        } catch (e: any) {
                console.log(e)
                return res.status(500).send(e?.message)
        }
})
app.post('/files', authorize, async (req, res) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const fileName = req.body?.fileName as string
                const passcode = req.body.passcode as string
                if (!fileName)
                        return res.status(400).send('File name is missing')
                const folder = getFolderName(fileName)

                if (!folder.endsWith('vault')) {
                        const url =
                                s3ClientManager.getSignedUrlForObject(fileName)
                        return res.status(200).send(url)
                }
                if (!passcode)
                        return res.status(400).send('Passcode is missing')

                const dbPassword = await redis.get(folder)
                if (passcode === dbPassword) {
                        const url =
                                s3ClientManager.getSignedUrlForObject(fileName)
                        return res.status(200).send(url)
                } else {
                        return res
                                .status(403)
                                .send('You cannot read from this folder')
                }
        } catch (e: any) {
                return res.status(500).send(e?.message)
        }
})

app.listen(PORT, () => {
        console.log(`Server started on ${PORT}`)
})
