
import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT:'#156859', light:'#49a18f', dark:'#0f4a40' } }
    }
  },
  plugins: []
}
export default config
