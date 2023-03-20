<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <input type="file" ref="fileInput" class="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
    </div>
    <button v-on:click="onSubmit" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Upload
    </button>
    <div v-if="uploadProgress.visible" class="relative w-full h-2 mt-4 bg-gray-200 rounded">
      <div :style="{ width: uploadProgress.percent + '%' }" class="absolute top-0 h-full bg-indigo-600 rounded"></div>
    </div>
  </div>
</template>

<script>
import blobServiceClient from '~/plugins/azureBlob'

export default {
  data() {
    return {
      file: null,
      uploadProgress: {
        visible: false,
        percent: 0
      }
    }
  },
  methods: {
    async onSubmit() {
  const file = this.$refs.fileInput.files[0]
  const containerName = 'mohit'
  const blobName = file.name
  const blockBlobClient = blobServiceClient
    .getContainerClient(containerName)
    .getBlockBlobClient(blobName)
  const existingBlob = await getExistingBlob(blockBlobClient)
  const blockIds = await uploadBlocks(blockBlobClient, file, existingBlob, this)
  await commitBlocks(blockBlobClient, blockIds, file.type, existingBlob)
  alert('File uploaded successfully')
  this.uploadProgress.visible = false
},
  }
}
  

async function getExistingBlob(blockBlobClient) {
  try {
    return await blockBlobClient.getProperties()
  } catch (error) {
    return null
  }
}

async function uploadBlocks(blockBlobClient, file, existingBlob, self) {
  const fileSize = file.size
  const maxBlockSize = 4 * 1024 * 1024 // 4 MB
  const numberOfBlocks = Math.ceil(fileSize / maxBlockSize)
  const blockIds = []
  let offset = 0
  self.uploadProgress.visible = true
  for (let i = 0; i < numberOfBlocks; i++) {
    const blockId = btoa(`block-${i}`)
    blockIds.push(blockId)
    const blockData = file.slice(offset, offset + maxBlockSize)
    const uploadOptions = {
      blobHTTPHeaders: { blobContentType: file.type },
      onProgress: progress => console.log(`Uploaded ${progress.loadedBytes} bytes`)
    }
    if (existingBlob && offset < existingBlob.contentLength) {
      await blockBlobClient.stageBlock(blockId, blockData, offset, {
        leaseAccessConditions: { modifiedAccessConditions: { ifMatch: existingBlob.etag } },
        ...uploadOptions
      })
    } else {
      await blockBlobClient.stageBlock(blockId, blockData, offset, uploadOptions)
    }
    offset += maxBlockSize
    self.uploadProgress.percent = Math.round(offset / fileSize * 100)
  }
  return blockIds
}

async function commitBlocks(blockBlobClient, blockIds, blobContentType, existingBlob) {
  const uploadOptions = { blobHTTPHeaders: { blobContentType } }
  if (existingBlob) {
    await blockBlobClient.commitBlockList(blockIds, {
      leaseAccessConditions: { modifiedAccessConditions: { ifMatch: existingBlob.etag } },
      ...uploadOptions
    })
  } else {
    await blockBlobClient.commitBlockList(blockIds, uploadOptions)
  }
}

</script>

