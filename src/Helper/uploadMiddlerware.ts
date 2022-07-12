import multer from 'multer'
import util from 'util'

const maxSize = 10 * 1024 * 1024

const storage = multer.memoryStorage()

const uploadFile = multer({
        storage: storage,
        limits: { fileSize: maxSize },
}).single('file')

export const uploadFileMiddleware = util.promisify(uploadFile)
