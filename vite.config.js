// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, '.', '')

//   return {
//     plugins: [react()],
//     server: {
//       proxy: {
//         '/api': {
//           target: env.NGROK_ORIGIN,
//           changeOrigin: true,
//           secure: true,
//           headers: {
//             'ngrok-skip-browser-warning': 'true',
//           },
//         },
//       },
//     },
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})