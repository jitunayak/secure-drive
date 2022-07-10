function getFolderName(fileName: string): string {
        return fileName.split('/').reduce((acc, curr, index): string => {
                if (index === fileName.split('/').length - 1) {
                        return acc
                }
                return `${acc}/${curr}`
        })
}

export { getFolderName }
