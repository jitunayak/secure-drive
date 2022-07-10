import { CONFIG } from './config'
import Express, { Request, Response } from 'express'
import { getListOfObjects, getSignedUrlForObject } from './s3-client'
import { authorize, getBearerToken } from './authentication'
import Redis from 'ioredis'

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

app.get('/files', authorize, (req: Request, res: Response) => {
        const token = getBearerToken(req) as string
        getListOfObjects(token)
                .then((data) => {
                        res.send(data?.Contents?.map((item) => item.Key))
                })
                .catch((err) => {
                        res.status(500).send(err)
                })
})

app.post('/folder', authorize, async (req: Request, res: Response) => {
        const { passcode, folderName } = req.body
        const dbPassword = await redis.get(folderName)
        console.log('dbPassword', dbPassword)
        if (passcode === dbPassword) {
                return res.send(201).send('Granted')
        }
        res.status(401).send('Unauthorized')
})

app.post('/secure/folder', authorize, async (req: Request, res: Response) => {
        const { passcode, folderName } = req.body
        const dbFolderName = folderName.concate('-vault')
        const dbPassword = await redis.set(dbFolderName, passcode)
        if (dbPassword === 'OK') {
                return res.send(201).send('Secure Folder Created')
        }
        res.status(500).send('Failed to create secure folder')
})
app.post('/files', authorize, async (req, res) => {
        const token = getBearerToken(req) as string
        const fileName = req.body?.fileName as string
        const passcode = req.body.passcode as string
        if (!fileName) return res.status(400).send('File name is missing')
        const folder = fileName
                .split('/')
                .reduce((acc, curr, index): string => {
                        if (index === fileName.split('/').length - 1) {
                                return acc
                        }
                        return `${acc}/${curr}`
                })
        if (!folder.endsWith('vault')) {
                const url = await getSignedUrlForObject(token, fileName)
                return res.status(200).send(url)
        }
        if (!passcode) return res.status(400).send('Passcode is missing')

        const dbPassword = await redis.get(folder)
        if (passcode === dbPassword) {
                const url = await getSignedUrlForObject(token, fileName)
                return res.status(200).send(url)
        } else {
                return res.status(403).send('You cannot read from this folder')
        }
})

app.listen(PORT, () => {
        console.log(`Server started on ${PORT}`)
})
