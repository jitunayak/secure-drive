import { _Object } from '@aws-sdk/client-s3'
import { getFolderName } from '../Helper/Helper'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const BuildFileDetail = async (
        s3ClientManager: any,
        object: _Object
) => {
        const filePath = object.Key as string
        const folder = getFolderName(filePath)
        const isVault = folder.endsWith('vault')
        const isFolder = object?.Key?.endsWith('/')
        const shouldCreateSignedURL = !isFolder && !isVault
        const name = !isFolder
                ? object?.Key?.split('/').pop()
                : object?.Key?.split('/')[object.Key.split('/').length - 2]

        return {
                name,
                url: shouldCreateSignedURL
                        ? await s3ClientManager.getSignedUrlForObject(
                                  object.Key
                          )
                        : null,
                type: isFolder ? 'folder' : 'file',
                size: object?.Size,
                lastModified: object?.LastModified,
                isVault,
                fullPath: filePath,
                level: isFolder
                        ? folder.split('/').length >= 2
                                ? folder.split('/').length - 2
                                : folder.split('/').length
                        : folder.split('/').length - 1,
        }
}
