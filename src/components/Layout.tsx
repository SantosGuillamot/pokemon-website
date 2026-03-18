import type { FC } from 'hono/jsx'
import Nav from './Nav'

type LayoutProps = {
  title?: string
  children: any
}

const Layout: FC<LayoutProps> = ({ title = 'Pokemon Website', children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link rel="stylesheet" href="/public/css/app.css" />
      </head>
      <body class="bg-gray-950 text-gray-100 min-h-screen font-sans antialiased">
        <Nav />
        {children}
        <script type="module" src="/public/js/index-store.js"></script>
      </body>
    </html>
  )
}

export default Layout
