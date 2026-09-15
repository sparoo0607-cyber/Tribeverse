import type { Metadata } from 'next'
import { Outfit, Space_Grotesk } from 'next/font/google'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap'})
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap'})

export const metadata: Metadata = {
 title: 'TRIBEVERSE V1 — Student Tribe Freshers Edition',
 description: 'The official TRIBEVERSE V1 event platform by Student Tribe.',
 openGraph: { title: 'TRIBEVERSE V1', description: 'Student Tribe Freshers Edition Event Platform'},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
 <body className="bg-[#111418] text-white antialiased font-body">
 {children}
 </body>
 </html>
 )
}
