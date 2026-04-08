// import multer from 'multer';
// import { Context, Next } from 'hono';

// // Configure multer to store files in memory (buffer)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   },
// });

// // Hono middleware wrapper for multer single file upload
// export const uploadSingleImage = () => {
//   return async (c: Context, next: Next) => {
//     return new Promise((resolve, reject) => {
//       upload.single('image')(c.req.raw, c.res, (err: any) => {
//         if (err) {
//           reject(err);
//         } else {
//           const file = (c.req.raw as any).file; // multer attaches file to the raw request
//           if (file) {
//             // Attach file to Hono context for later access
//             c.set('uploadedFile', file);
//           }
//           resolve(next());
//         }
//       });
//     }).catch((err) => {
//       return c.json({ error: err.message }, 400);
//     });
//   };
// };