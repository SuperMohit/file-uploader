import { BlobServiceClient } from '@azure/storage-blob'


const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
export default blobServiceClient
