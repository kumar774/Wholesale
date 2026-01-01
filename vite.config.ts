// import path from 'path';
// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig(({ mode }) => {
//     const env = loadEnv(mode, '.', '');
//     return {
//       server: {
//         port: 3000,
//         host: '0.0.0.0',
//       },
//       plugins: [react()],
//       define: {
//         'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
//         'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
//       },
//       resolve: {
//         alias: {
//           '@': path.resolve(__dirname, '.'),
//         }
//       }
//     };
// });
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // env load karne ki bhi zaroorat nahi agar key nahi chahiye, par rehne de toh bhi chalega
    const env = loadEnv(mode, '.', ''); 
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // WO 'define' WALA BLOCK YAHAN SE HATA DIYA HAI
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
