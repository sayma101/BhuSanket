import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ExperienceProvider } from '@/components/experience';
import { SiteNav } from '@/components/site-nav';
import Link from 'next/link';
import {AskBhuSanket} from '@/components/ask-bhusanket';
import '@/styles/discovery.css';
import {NavigationHistory} from '@/lib/navigation';
import '@/styles/navigation.css';
export const metadata: Metadata = { title: 'BhuSanket — Earth Systems Discovery & Evidence Lab', description: "Read Earth's signals. Trace every change. Investigate NASA Earth data with transparent statistics and traceable evidence." };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) {
 return <html lang="en"><body><ExperienceProvider><NavigationHistory/><a className="skip-link" href="#main">Skip to content</a><SiteNav/><main id="main">{children}</main><AskBhuSanket/><footer className="site-footer"><Link href="/" className="wordmark">BHUSANKET<span>EARTH SYSTEMS DISCOVERY & EVIDENCE LAB</span></Link><p>A local question.<br/>A planetary perspective.</p><div><Link href="/methods">Data, methods & credits ↗</Link><Link href="/claims">Climate Claim Checker ↗</Link><span>NASA Space Apps 2026 · Independent team project</span></div></footer></ExperienceProvider></body></html>;
}
