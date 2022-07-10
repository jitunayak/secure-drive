/* eslint-disable @typescript-eslint/no-explicit-any */
export const BuildFileDetail = async (
        s3ClientManager: any,
        object: any,
        isFolder: boolean
) => {
        return {
                name: object?.Key,
                url: isFolder
                        ? await s3ClientManager.getSignedUrlForObject(
                                  object.Key
                          )
                        : object?.Key,
                type: isFolder ? 'folder' : 'file',
        }
}
