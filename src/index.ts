import { CONFIG } from './config'
import Express from 'express'

console.log('Running Envrionemt:', CONFIG.ENV)
const PORT = CONFIG.PORT

const app = Express()

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`)
})
