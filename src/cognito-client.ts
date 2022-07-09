/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromCognitoIdentityPool as FromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { CONFIG } from './config'

const identityPoolId = CONFIG.COGNITO_IDENTITY_POOL_ID
const identityProvider = CONFIG.COGNITO_IDENTITY_PROVIDER
const region = CONFIG.COGNITO_REGION

const credentials = async (idToken: string) => {
        const cognito = await FromCognitoIdentityPool({
                client: new CognitoIdentityClient({
                        region,
                }),
                identityPoolId,
                logins: {
                        [identityProvider]: idToken,
                },
        })

        return cognito()
}

export { credentials as CognitoCredentials }
