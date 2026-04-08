// import Busboy from 'busboy';
// import { Context } from 'hono';

// interface UploadResult {
//   fields: Record<string, string>;
//   file?: {
//     buffer: Buffer;
//     filename: string;
//     mimetype: string;
//   };
// }

// export const parseMultipart = async (c: Context): Promise<UploadResult> => {
//   return new Promise((resolve, reject) => {
//     const contentType = c.req.header('content-type');
//     if (!contentType || !contentType.includes('multipart/form-data')) {
//       return reject(new Error('Expected multipart/form-data'));
//     }

//     const busboy = Busboy({ headers: { 'content-type': contentType } });
//     const fields: Record<string, string> = {};
//     let fileBuffer: Buffer | null = null;
//     let fileInfo: { filename: string; mimetype: string } | null = null;

//     busboy.on('field', (fieldname, value) => {
//       fields[fieldname] = value;
//     });

//     busboy.on('file', (fieldname, file, info) => {
//       const chunks: Buffer[] = [];
//       file.on('data', (chunk) => chunks.push(chunk));
//       file.on('end', () => {
//         fileBuffer = Buffer.concat(chunks);
//         fileInfo = { filename: info.filename, mimetype: info.mimeType };
//       });
//     });

//     busboy.on('close', () => {
//       if (!fileBuffer) {
//         return reject(new Error('No file uploaded'));
//       }
//       resolve({
//         fields,
//         file: {
//           buffer: fileBuffer,
//           filename: fileInfo!.filename,
//           mimetype: fileInfo!.mimetype,
//         },
//       });
//     });

//     busboy.on('error', (err) => reject(err));

//     // Get the raw Node.js request body
//     c.req.raw.pipe(busboy);
//   });
// };