import { BlobServiceClient } from '@azure/storage-blob'


const connectionString = 'BlobEndpoint=https://adfoffice365data.blob.core.windows.net/;QueueEndpoint=https://adfoffice365data.queue.core.windows.net/;FileEndpoint=https://adfoffice365data.file.core.windows.net/;TableEndpoint=https://adfoffice365data.table.core.windows.net/;SharedAccessSignature=sv=2021-12-02&ss=b&srt=co&sp=rwdlaciytfx&se=2023-03-20T18:28:46Z&st=2023-03-20T10:29:46Z&spr=https&sig=cbNbjTHJhd9UtkSeyM2xSi6U3DHM3F67FwTy4Vk6AQU%3D'
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
export default blobServiceClient
