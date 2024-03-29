/* eslint-disable @typescript-eslint/no-explicit-any */
import Express, { Request, Response } from 'express'
import { CONFIG } from './config'

import cors from 'cors'
import helmet from 'helmet'
import Redis from 'ioredis'
import { BuildFileDetail } from './Builder/builder'
import { S3ClientManager } from './Client/s3-client'
import { authorize, getBearerToken } from './Helper/authentication'
import { getFolderName } from './Helper/Helper'
import { uploadFileMiddleware } from './Helper/uploadMiddlerware'

console.log('Running Envrionemt:', CONFIG.ENV)
const PORT = CONFIG.PORT

const redis = new Redis({
        host: CONFIG.REDIS_HOST,
        port: CONFIG.REDIS_PORT,
        password: CONFIG.REDIS_PASSWORD,
})

const app = Express()
app.use(Express.json())
app.use(helmet())
app.use(cors())
app.get('/', (req, res) => {
        res.send('Secure Drive Server is running')
})
app.get('/basepath', async (req, res) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))
                const basePath = await s3ClientManager.getBasePath()
                console.log('basepath', basePath)
                return res.status(200).send({ basePath })
        } catch (err) {
                console.log('basepath error', err)
                return res.status(500).send({ error: err })
        }
})
app.get('/files', authorize, async (req: Request, res: Response) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const listOfObjects = await s3ClientManager.getListOfObjects()
                if (!listOfObjects?.Contents) {
                        return res.status(404).send({ files: [] })
                }
                const files = listOfObjects?.Contents?.map(
                        async (object: any) => {
                                return await BuildFileDetail(
                                        s3ClientManager,
                                        object
                                )
                        }
                )
                Promise.all(files as any).then((files) => {
                        // console.log(files)
                        return res.status(200).send(files)
                })
        } catch (e: any) {
                return res.status(500).send(e?.message)
        }
})

app.post(
        '/folder/passcheck',
        authorize,
        async (req: Request, res: Response) => {
                try {
                        const { passcode, folderName } = req.body
                        if (!passcode || !folderName)
                                return res.status(400).send('Invalid Request')

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
                console.log('folder', req.body)

                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const { passcode, folderName } = req.body
                if (!folderName) return res.status(400).send('Invalid Request')

                const dbFolderName =
                        passcode !== undefined
                                ? folderName + '-vault'
                                : folderName
                passcode && (await redis.set(dbFolderName, passcode))

                console.log('Creating Folder:', folderName)

                await s3ClientManager.createFolder(dbFolderName)
                return res
                        .status(201)
                        .send(folderName.split('/')[1] + 'Folder is Created')
        } catch (e: any) {
                console.log(e)
                return res.status(500).send(e?.message)
        }
})
app.get('/files/signedurl', authorize, async (req, res) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))

                const fileName = req.body?.fileName as string
                const passcode = req.body.passcode as string

                if (!fileName)
                        return res.status(400).send('File name is missing')
                const folder = getFolderName(fileName)

                // * check if folder is not password protected
                if (!folder.endsWith('vault')) {
                        const url = await s3ClientManager.getSignedUrlForObject(
                                fileName
                        )
                        return res.status(200).send(url)
                }
                if (!passcode)
                        return res.status(400).send('Passcode is missing')

                const dbPassword = await redis.get(folder)
                if (passcode === dbPassword) {
                        const url = await s3ClientManager.getSignedUrlForObject(
                                fileName
                        )
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

app.post('/files/', authorize, uploadFileMiddleware, async (req, res) => {
        try {
                if (req?.file == undefined) {
                        return res
                                .status(400)
                                .send({ message: 'Please upload a file!' })
                }
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))
                const remoteLocation = req.headers.remotelocation as string
                await s3ClientManager.uploadFile(
                        req.file.buffer,
                        req.file.originalname,
                        remoteLocation
                )
                return res.status(200).send({
                        message:
                                'Uploaded the file successfully: ' +
                                req.file.originalname,
                })
        } catch (err: any) {
                console.log(err)
                if (err.code == 'LIMIT_FILE_SIZE') {
                        return res.status(500).send({
                                message: 'File size cannot be larger than 2MB!',
                        })
                }
                return res.status(500).send({
                        message: `Could not upload the file: ${req?.file?.originalname}. ${err}`,
                })
        }
})

app.delete('/files/', authorize, async (req, res) => {
        try {
                const s3ClientManager = new S3ClientManager()
                await s3ClientManager.build(getBearerToken(req))
                const filePath = req.body?.filePath as string
                await s3ClientManager.deleteFile(filePath)
                return res.status(200).send({ message: 'File deleted' })
        } catch (e: any) {
                return res.status(500).send(e?.message)
        }
})
app.listen(PORT, () => {
        console.log(`Server started on ${PORT}`)
})
