import * as dotenv from 'dotenv'
import { resolve } from 'path'

const MISSING_ENV = 'Envrionemt is not set for'

const env = process.env.NODE_ENV
if (env === undefined) throw new Error(`${MISSING_ENV} NODE_ENV`)

const path = configureEnvPath(env)
dotenv.config({ path: path })

export const CONFIG = {
        MONGO_URI: process.env.MONGO_URI,
        ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        COGNITO_IDENTITY_POOL_ID: process.env
                .COGNITO_IDENTITY_POOL_ID as string,
        COGNITO_IDENTITY_PROVIDER: process.env
                .COGNITO_IDENTITY_PROVIDER as string,
        COGNITO_REGION: process.env.COGNITO_REGION as string,
        BUCKET_NAME: process.env.BUCKET_NAME as string,
        S3_REGION: process.env.S3_REGION as string,
        REDIS_HOST: process.env.REDIS_HOST as string,
        REDIS_PORT: Number(process.env.REDIS_PORT),
        REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
}

validateEnvironment()

function configureEnvPath(env: string): string | undefined {
        switch (env) {
                case 'dev': {
                        const path = resolve(
                                __dirname,
                                `./../env/${process.env.NODE_ENV}.env`
                        )
                        return path
                }
                case 'prod': {
                        return undefined // prod deployment will have system enviroment values
                }
                default:
                        throw new Error('No Envrionemt is specified')
        }
}

function validateEnvironment() {
        Object.entries(CONFIG).map((key) => {
                if (key[1] === undefined || key[1] === null)
                        throw new Error(`${MISSING_ENV} ${key[0]}`) // throw error if any enviroment values are missing
        })
}
