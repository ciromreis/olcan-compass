import config from '@/payload.config'
import '@payloadcms/next/css'
import './admin/custom.scss'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from './importMap'
import React from 'react'

const Layout = ({ children }: any) => (
  <RootLayout 
    config={config} 
    importMap={importMap} 
    serverFunction={handleServerFunctions as any}
  >
    {children}
  </RootLayout>
)

export default Layout
