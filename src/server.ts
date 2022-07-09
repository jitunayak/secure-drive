import { CONFIG } from './config'
import Express from 'express'
import { getListOfObjects, getSignedUrlForObject } from './s3-client'

console.log('Running Envrionemt:', CONFIG.ENV)
const PORT = CONFIG.PORT

const app = Express()
app.use(Express.json())

app.get('/', (req, res) => {
        res.send('Secure Drive Public End Point')
})

app.get('/files', (req, res) => {
        const bearerToken = req.headers['authorization']
        if (!bearerToken) {
                res.status(401).send('Auth Header is missing')
        }
        const token = bearerToken?.split(' ')[1] as string
        if (!token) {
                res.status(401).send('Unauthorized')
        }

        getListOfObjects(token)
                .then((data) => {
                        res.send(data?.Contents?.map((item) => item.Key))
                })
                .catch((err) => {
                        res.status(500).send(err)
                })
})

app.post('/files', (req, res) => {
        const bearerToken = req.headers['authorization']
        if (!bearerToken) {
                res.status(401).send('Auth Header is missing')
        }
        const token = bearerToken?.split(' ')[1] as string
        if (!token) {
                res.status(401).send('Unauthorized')
        }

        const fileName = req.body.fileName
        getSignedUrlForObject(token, fileName)
                .then((url) => {
                        res.send(url)
                })
                .catch((err) => {
                        res.status(500).send(err)
                })
})

app.listen(PORT, () => {
        console.log(`Server started on ${PORT}`)
})
