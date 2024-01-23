import '@/styles/globals.css'
import type { AppProps } from 'next/app'

export const fetchCache = 'force-no-store';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
