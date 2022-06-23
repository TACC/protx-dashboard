import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {readFileSync} from 'fs';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      _common: resolve(__dirname, 'src/components/_common'),
      utils: resolve(__dirname, 'src/utils') //,
      // this is required for the SCSS modules
      // find: /^~(.*)$/,
      // replacement: '$1'
    }
  },
  server: {
    host: 'cep.dev',
    https: {
      key: readFileSync('../conf/certificates/cep.dev.key'),
      cert: readFileSync('../conf/certificates/cep.dev.crt')
    }
  }
});
