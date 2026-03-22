import './globals.css'

export const metadata = {
  title: 'Growth Hub',
  description: 'Growth Operator Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
