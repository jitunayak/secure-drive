/* eslint-disable @typescript-eslint/no-explicit-any */
import { fromCognitoIdentityPool as FromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity'
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity'
import { CONFIG } from './config'

const identityPoolId = CONFIG.COGNITO_IDENTITY_POOL_ID
const identityProvider = CONFIG.COGNITO_IDENTITY_PROVIDER
const region = CONFIG.COGNITO_REGION

const idToken =
    'eyJraWQiOiJBbUdsdTArbGljOThOaFA5N3p3R3dhdXBiYlc2clNPTHVlWnIyblFrNk84PSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiSXplQml0REZoUnYxWnRDSHVCSEVMQSIsInN1YiI6IjE0ZjA5MzU2LWI3YzgtNDk1OS04ODExLWY3YzE2YzMyNjZiNiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX1kySDF4cDQ0byIsImNvZ25pdG86dXNlcm5hbWUiOiIxNGYwOTM1Ni1iN2M4LTQ5NTktODgxMS1mN2MxNmMzMjY2YjYiLCJhdWQiOiIzdDF0bXJ1MGlkODk3Zm5rZm10YzRjcm9pIiwiZXZlbnRfaWQiOiI5OWQ1ZjdhYi0zNTMyLTQzNDUtYjEzMy1jOTZhOTQ1MWU3NzAiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY1NzM5NTk3OSwiZXhwIjoxNjU3Mzk5NTc5LCJpYXQiOjE2NTczOTU5NzksImp0aSI6IjE3ZjY5MTViLTQ5M2MtNDU3Yi1iZmY5LTUzYzk4OWU5MzUxMCIsImVtYWlsIjoiaml0dW5heWFrNzE1QGdtYWlsLmNvbSJ9.J8MMb2VN_Xfz_XT1afzRm0McH6rKeIU7iBBgqztiz3VPd8Ll7sKbVt56WGNi5Tcp3ig99galdrwdEDFG0pXDHV2jiSSLx6TaDy40LUdqome9QL524ZD4JnXx8qv3j5HNx678T1PXEbvzQ-UPgMwm5c863Bj3aLCS7mBZFuLiyIhLHk9gkYbKxrQA8R9H2oAifXgJF_JwzZNeUum7GQFl_n3dyYABNTAYAir90mLBmuvz3FAFFRB0ukNUy-Li2sHkkGFkNwvOAsTISfIrDue1k0X7kZCcdbOHWQewffRbwBJfGQVF2-Gib6CvXiBKIG4EqBb7QuL773ZsrxmayXYecA'

const credentials = async () => {
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
