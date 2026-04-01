import './globals.css'
export const metadata = { title: 'Growth Hub', description: 'Agency OS for Growth Operators' }
export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
