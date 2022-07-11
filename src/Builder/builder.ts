import { getFolderName } from '../Helper/Helper'

/* eslint-disable @typescript-eslint/no-explicit-any */
export const BuildFileDetail = async (s3ClientManager: any, object: any) => {
        const filePath = object.Key as string
        const folder = getFolderName(filePath)
        const isVault = folder.endsWith('vault')
        const isFolder = object.Key.endsWith('/')
        const shouldCreateSignedURL = !isFolder && !isVault
        const name = !isFolder
                ? object?.Key.split('/').pop()
                : object?.Key.split('/')[1]

        return {
                name,
                url: shouldCreateSignedURL
                        ? await s3ClientManager.getSignedUrlForObject(
                                  object.Key
                          )
                        : null,
                type: isFolder ? 'folder' : 'file',
                isVault,
                FullPath: filePath,
        }
}
