import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { ReactElement, ReactNode } from 'react'
import Head from 'next/head'

export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}


function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)
  
  return getLayout(
    <>
      <Head>
      <link rel="shortcut icon" href="https://s2.coinmarketcap.com/static/img/coins/200x200/5647.png" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
