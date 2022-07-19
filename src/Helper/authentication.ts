import { NextFunction, Request, Response } from 'express'

export function authorize(req: Request, res: Response, next: NextFunction) {
        const bearerToken = req.headers['authorization']
        if (!bearerToken) {
                return res.status(401).send('Auth Header is missing')
        }
        const token = bearerToken?.split(' ')[1] as string
        if (!token) {
                return res.status(401).send('Unauthorized')
        }
        next()
}

export function getBearerToken(req: Request) {
        const bearerToken = req.headers['authorization']
        if (!bearerToken) {
                throw new Error('Auth Header is missing')
        }
        return bearerToken?.split(' ')[1] as string
}
