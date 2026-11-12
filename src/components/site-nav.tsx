'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useJourney, BackButton } from '@/lib/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import '@/styles/workspace-nav.css';

const links = [['/explore','Explore Earth'],['/student-lab','Student Lab'],['/claim-court','Claim Court'],['/research','Research Workspace'],['/methods','Data & Methods']];
const workspaceLinks = [['/','Home'],['/explore','Explore Earth'],['/research','Research'],['/student-lab','Student Lab'],['/claim-court','Claim Court']];
export function SiteNav() {
  const path = usePathname();
  const menu=useJourney('navigation-menu',{open:false});
  const {open}=menu.value;const setOpen=menu.field('open');
  const reference = ['/research','/student-lab','/claim-court'].includes(path);
  return <header className={`site-header ${reference ? 'reference-shell' : ''} ${path === '/student-lab' ? 'academy-shell' : ''}`}>
    <Link className="brand" href="/" aria-label="BhuSanket home"><svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="21" ry="12" transform="rotate(-32 24 24)"/><ellipse cx="24" cy="24" rx="21" ry="18" transform="rotate(-32 24 24)"/><circle cx="24" cy="24" r="7"/><circle cx="41" cy="14" r="3" className="brand-dot"/></svg>{reference ? <span className="reference-wordmark">Bhu<span>Sanket</span><small>Earth Systems Discovery & Evidence Lab</small></span> : <span className="wordmark">BHUSANKET<span>EARTH EVIDENCE LAB</span></span>}</Link>
    {path!=='/'&&<BackButton/>}<nav aria-label="Main navigation" className={open ? 'nav-links open' : 'nav-links'}>{(reference ? workspaceLinks : links).map(([href,label]) => <Link key={href} href={href} onClick={() => menu.navigate({open:false},false,true)} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav>
    <Link className="nav-action" href={reference ? '/methods' : '/explore'}>{reference ? 'Data & Methods' : 'Open the lab'}<ArrowUpRight size={14}/></Link>
    <button className="mobile-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => open?menu.navigate({open:false},true):setOpen(true)}>{open ? <X/> : <Menu/>}</button>
  </header>;
}
