import multer from 'multer'
import util from 'util'

const maxSize = 200 * 1024 * 1024

const storage = multer.memoryStorage()

const uploadFile = multer({
        storage: storage,
        limits: { fileSize: maxSize },
}).single('file')

const uploadFileMiddleware = util.promisify(uploadFile)
export { uploadFileMiddleware }
