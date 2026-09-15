'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import './landing.css'

interface Note {
 id: number
 text: string
 r: string
 c: string
}

const INITIAL_NOTES: Note[] = [
 { id: 1, text: 'I want to start my own company', r: '-3deg', c: '#FFE600'},
 { id: 2, text: 'Travel to 10 different cities', r: '2deg', c: '#FF6BDE'},
 { id: 3, text: 'Learn to code something real', r: '-2deg', c: '#00FFD1'},
 { id: 4, text: 'Perform on a stage', r: '4deg', c: '#FF8C42'},
 { id: 5, text: 'Make 100 real friends', r: '-1deg', c: '#FFE600'},
 { id: 6, text: 'Build something people use', r: '3deg', c: '#6BFFA0'},
 { id: 7, text: 'Win a national competition', r: '-4deg', c: '#FF6BDE'},
 { id: 8, text: 'Publish my first article', r: '1deg', c: '#00FFD1'},
 { id: 9, text: 'Find my tribe', r: '-2deg', c: '#FF8C42'},
 { id: 10, text: 'Land my dream internship', r: '3deg', c: '#FFE600'},
 { id: 11, text: 'Create something viral', r: '-3deg', c: '#6BFFA0'},
 { id: 12, text: 'Meet someone who inspires me', r: '2deg', c: '#FF6BDE'},
]

export default function LandingPage() {
 const [navScrolled, setNavScrolled] = useState(false)
 const [menuOpen, setMenuOpen] = useState(false)
 const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES)
 const [dreamInput, setDreamInput] = useState('')

 useEffect(() =>{
 const handleScroll = () =>{
 setNavScrolled(window.scrollY >40)
 }
 window.addEventListener('scroll', handleScroll)
 return () =>window.removeEventListener('scroll', handleScroll)
 }, [])

 const addDream = (e: React.FormEvent) =>{
 e.preventDefault()
 if (!dreamInput.trim()) return
 const colors = ['#FFE600', '#FF6BDE', '#00FFD1', '#FF8C42', '#6BFFA0']
 const rot = (Math.random() * 8 - 4).toFixed(1) +'deg'
 const col = colors[Math.floor(Math.random() * colors.length)]
 setNotes(prev =>[{ id: Date.now(), text: dreamInput.trim(), r: rot, c: col }, ...prev])
 setDreamInput('')
 }

 return (
 <div className="landing-body">
 {/* ── NAVBAR ── */}
 <nav className={` nav ${navScrolled ? 'scrolled': ''}`}>
 <div className="nav-inner">
 <Link href="#hero" className="nav-logo">
 <span className="nav-logo-st">st.</span>
 <span className="nav-logo-text">Student Tribe</span>
 </Link>
 <button className="nav-toggle" onClick={() =>setMenuOpen(!menuOpen)} aria-label="Toggle menu">
 <span></span><span></span><span></span>
 </button>
 <ul className={` nav-links ${menuOpen ? 'open': ''}`}>
 <li><a href="#overview" className="nav-link" onClick={() =>setMenuOpen(false)}>Overview</a></li>
 <li><a href="#schedule" className="nav-link" onClick={() =>setMenuOpen(false)}>Schedule</a></li>
 <li><a href="#playground" className="nav-link" onClick={() =>setMenuOpen(false)}>Playground</a></li>
 <li><a href="#detective" className="nav-link" onClick={() =>setMenuOpen(false)}>Detective</a></li>
 <li><a href="#arcade" className="nav-link" onClick={() =>setMenuOpen(false)}>Arcade</a></li>
 <li><a href="#impossible" className="nav-link" onClick={() =>setMenuOpen(false)}>Impossible</a></li>
 <li><a href="#jam" className="nav-link" onClick={() =>setMenuOpen(false)}>Jam</a></li>
 <li><a href="#wall" className="nav-link" onClick={() =>setMenuOpen(false)}>Wall</a></li>
 <li><a href="#reveal" className="nav-link" onClick={() =>setMenuOpen(false)}>Reveal</a></li>
 <li>
 <Link href="/login" className="nav-link nav-link-login" onClick={() =>setMenuOpen(false)}>
 LOGIN 
 </Link>
 </li>
 <li>
 <Link href="/register" className="nav-link nav-link-cta" onClick={() =>setMenuOpen(false)}>
 ENTER TRIBEVERSE →
 </Link>
 </li>
 </ul>
 </div>
 </nav>

 {/* ── 1. HERO SECTION ── */}
 <section className="hero" id="hero">
 <div className="hero-bg-grid"></div>
 <div className="hero-sparkles">
 <span className="sparkle s1"></span>
 <span className="sparkle s2"></span>
 <span className="sparkle s3"></span>
 <span className="sparkle s4"></span>
 <span className="sparkle s5"></span>
 <span className="sparkle s6"></span>
 <span className="sparkle s7"></span>
 <span className="sparkle s8"></span>
 </div>
 <div className="hero-wavy-deco top-deco"></div>
 <div className="hero-inner">
 <div className="hero-badge">FRESHERS EDITION</div>
 <p className="hero-org">STUDENT TRIBE PRESENTS</p>
 <h1 className="hero-title">
 <span className="ht-tribe">TRIBE</span>
 <span className="ht-verse">VERSE</span>
 <span className="ht-v1">V1</span>
 </h1>
 <p className="hero-tagline">ONE TEAM. FIVE PEOPLE.<br/>FIVE EXPERIENCES.</p>
 <div className="hero-stats">
 <div className="hero-stat">
 <span className="stat-num">20</span>
 <span className="stat-label">Teams</span>
 </div>
 <span className="stat-dot"></span>
 <div className="hero-stat">
 <span className="stat-num">5</span>
 <span className="stat-label">Members Each</span>
 </div>
 <span className="stat-dot"></span>
 <div className="hero-stat">
 <span className="stat-num">100</span>
 <span className="stat-label">Participants</span>
 </div>
 </div>
 <div className="hero-actions">
 <Link href="/register" className="hero-cta">
 ENTER TRIBEVERSE →
 </Link>
 <a href="#overview" className="hero-cta-secondary">
 Explore Playbook 
 </a>
 </div>
 </div>
 <div className="hero-wavy-deco bottom-deco"></div>
 </section>

 {/* ── 2. EVENT OVERVIEW ── */}
 <section className="section overview" id="overview">
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">02</div>
 <div className="sec-header">
 <h2 className="sec-title yellow-t">EVENT OVERVIEW</h2>
 <p className="sec-sub">A day built for freshers to discover their tribe</p>
 </div>
 <div className="overview-grid">
 <div className="ov-card">
 <div className="ov-icon"></div>
 <h3>The Concept</h3>
 <p>TRIBEVERSE is a one-day freshers event where 20 teams of 5 compete across multiple unique challenges — each designed to unlock a different skill and personality.</p>
 </div>
 <div className="ov-card">
 <div className="ov-icon"></div>
 <h3>The Format</h3>
 <p>Each team member takes on a different event, contributing their unique ability to the team's overall score. One team. Five experiences. Infinite memories.</p>
 </div>
 <div className="ov-card">
 <div className="ov-icon"></div>
 <h3>The Stakes</h3>
 <p>From speed challenges to music battles, detective games to arcade showdowns — every round counts. Every point matters. Find out who your tribe really is.</p>
 </div>
 </div>
 <div className="marquee-wrapper">
 <div className="marquee-track">
 <span>TRIBEVERSE V1</span><span className="mx"></span>
 <span>FRESHERS EDITION</span><span className="mx"></span>
 <span>20 TEAMS</span><span className="mx"></span>
 <span>100 PARTICIPANTS</span><span className="mx"></span>
 <span>ONE DAY</span><span className="mx"></span>
 <span>FIVE EXPERIENCES</span><span className="mx"></span>
 <span>TRIBEVERSE V1</span><span className="mx"></span>
 <span>FRESHERS EDITION</span><span className="mx"></span>
 <span>20 TEAMS</span><span className="mx"></span>
 <span>100 PARTICIPANTS</span><span className="mx"></span>
 <span>ONE DAY</span><span className="mx"></span>
 <span>FIVE EXPERIENCES</span><span className="mx"></span>
 </div>
 </div>
 </div>
 </section>

 {/* ── 3. EVENT SCHEDULE ── */}
 <section className="section schedule-sec" id="schedule">
 <div className="schedule-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num light-num" aria-hidden="true">03</div>
 <div className="sec-header">
 <h2 className="sec-title white-t">EVENT SCHEDULE</h2>
 <p className="sec-sub light-sub">The full day, minute by minute</p>
 </div>
 <div className="schedule-table">
 <div className="srow srow-head">
 <div className="stime">TIME</div>
 <div className="sevent">EVENT</div>
 <div className="stype">TYPE</div>
 </div>
 <div className="srow"><div className="stime">9:00 AM</div><div className="sevent"><span className="sname">Registration &amp; Welcome</span></div><div className="stype"><span className="sbadge sb-blue">Opening</span></div></div>
 <div className="srow"><div className="stime">9:30 AM</div><div className="sevent"><span className="sname">Inauguration</span></div><div className="stype"><span className="sbadge sb-yellow">Ceremony</span></div></div>
 <div className="srow"><div className="stime">10:00 AM</div><div className="sevent"><span className="sname">Tribe Playground</span><span className="sdetail">5 Rounds · 5 Members · 5 Abilities</span></div><div className="stype"><span className="sbadge sb-pink">Challenge</span></div></div>
 <div className="srow"><div className="stime">11:15 AM</div><div className="sevent"><span className="sname">The Tribe Detective</span><span className="sdetail">Mystery. Logic. Deduction.</span></div><div className="stype"><span className="sbadge sb-purple">Mystery</span></div></div>
 <div className="srow srow-lunch"><div className="stime">1:00 PM</div><div className="sevent"><span className="sname">Lunch Break</span></div><div className="stype"><span className="sbadge sb-green">Break</span></div></div>
 <div className="srow"><div className="stime">2:00 PM</div><div className="sevent"><span className="sname">Tribe Arcade</span><span className="sdetail">Puzzle Drop · Emoji Movie · and more</span></div><div className="stype"><span className="sbadge sb-orange">Arcade</span></div></div>
 <div className="srow"><div className="stime">3:30 PM</div><div className="sevent"><span className="sname">The Impossible Challenge</span></div><div className="stype"><span className="sbadge sb-red">Intense</span></div></div>
 <div className="srow"><div className="stime">4:30 PM</div><div className="sevent"><span className="sname">Tribe Jam</span><span className="sdetail">Music. Expression. Vibes.</span></div><div className="stype"><span className="sbadge sb-teal">Music</span></div></div>
 <div className="srow"><div className="stime">5:30 PM</div><div className="sevent"><span className="sname">The Tribe Wall</span><span className="sdetail">Before I Graduate, I Want To...</span></div><div className="stype"><span className="sbadge sb-yellow">Interactive</span></div></div>
 <div className="srow srow-final"><div className="stime">6:00 PM</div><div className="sevent"><span className="sname">TRIBEVERSE REVEAL</span><span className="sdetail">Results · Celebration · Your Tribe Awaits</span></div><div className="stype"><span className="sbadge sb-glow">FINALE</span></div></div>
 </div>
 </div>
 <div className="schedule-wavy-bottom"></div>
 </section>

 {/* ── 4. INAUGURATION ── */}
 <section className="section inaug-sec" id="inauguration">
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">04</div>
 <div className="inaug-layout">
 <div className="inaug-text">
 <h2 className="sec-title lime-t">INAUGURATION</h2>
 <p className="inaug-desc">Every great story has a beginning. TRIBEVERSE begins with a declaration — 100 freshers stepping into something larger than themselves. Today is the day your tribe is born.</p>
 <div className="inaug-details">
 <div className="idetail"><span className="ilabel">TIME</span><span className="ival">9:30 AM</span></div>
 <div className="idetail"><span className="ilabel">FORMAT</span><span className="ival">Opening Ceremony</span></div>
 <div className="idetail"><span className="ilabel">TEAMS</span><span className="ival">All 20 Present</span></div>
 </div>
 </div>
 <div className="inaug-emblem">
 <div className="emb-ring er1"></div>
 <div className="emb-ring er2"></div>
 <div className="emb-ring er3"></div>
 <div className="emb-center">
 <span className="emb-st">st.</span>
 <span className="emb-lbl">Student Tribe</span>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── 5. TRIBE PLAYGROUND ── */}
 <section className="section playground-sec" id="playground">
 <div className="pg-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num light-num" aria-hidden="true">05</div>
 <div className="sec-header">
 <h2 className="sec-title white-t">TRIBE PLAYGROUND</h2>
 <p className="sec-sub light-sub">5 Rounds · 5 Members · 5 Different Abilities</p>
 </div>
 <div className="rounds-grid">
 <div className="round-card">
 <div className="rnum">01</div>
 <div className="ricon"></div>
 <h3 className="rname">QUICK EYES</h3>
 <p>Spot it before anyone else. Visual speed is everything in this round.</p>
 </div>
 <div className="round-card">
 <div className="rnum">02</div>
 <div className="ricon"></div>
 <h3 className="rname">QUICK DRAW</h3>
 <p>Sketch it fast. Make your team guess it faster. Every second counts.</p>
 </div>
 <div className="round-card">
 <div className="rnum">03</div>
 <div className="ricon"></div>
 <h3 className="rname">THINK FAST</h3>
 <p>No time to overthink. Your first instinct might just be your best one.</p>
 </div>
 <div className="round-card">
 <div className="rnum">04</div>
 <div className="ricon"></div>
 <h3 className="rname">SOUND CHECK</h3>
 <p>Listen. Identify. Win. Music knowledge meets lightning reflexes.</p>
 </div>
 <div className="round-card">
 <div className="rnum">05</div>
 <div className="ricon"></div>
 <h3 className="rname">REACTION GAME</h3>
 <p>Pure instinct. Zero hesitation. The fastest reaction wins it all.</p>
 </div>
 </div>
 <p className="pg-quote">"One playground. Five ways to prove yourself."</p>
 </div>
 <div className="pg-wavy-bottom"></div>
 </section>

 {/* ── 6. TRIBE DETECTIVE ── */}
 <section className="section detective-sec" id="detective">
 <div className="det-bg-dots"></div>
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">06</div>
 <div className="det-header">
 <div className="det-tape">CASE FILE: CLASSIFIED</div>
 <h2 className="sec-title det-t">THE TRIBE DETECTIVE</h2>
 <p className="det-sub">Mystery. Logic. Deduction. Your tribe's best mind takes the stand.</p>
 </div>
 <div className="det-content">
 <div className="case-file">
 <div className="cf-header">
 <span className="cf-id">CASE FILE #TV-001</span>
 <span className="cf-status">● ACTIVE</span>
 </div>
 <div className="cf-body">
 <div className="clue"><span className="cl-icon"></span><div><strong>Observation Skills</strong><p>Find hidden patterns in plain sight. Attention to detail is your weapon.</p></div></div>
 <div className="clue"><span className="cl-icon"></span><div><strong>Logical Deduction</strong><p>Connect the dots. One wrong assumption and the case goes cold.</p></div></div>
 <div className="clue"><span className="cl-icon"></span><div><strong>Evidence Analysis</strong><p>Every detail matters. The truth is in the evidence — if you know where to look.</p></div></div>
 <div className="clue"><span className="cl-icon"></span><div><strong>Time Pressure</strong><p>The clock is ticking. Can your detective instincts keep up?</p></div></div>
 </div>
 </div>
 <blockquote className="det-quote">"Every team has a detective.<br/>Today, yours will be tested."</blockquote>
 </div>
 </div>
 </section>

 {/* ── 7. LUNCH BREAK ── */}
 <section className="section lunch-sec" id="lunch">
 <div className="lunch-inner">
 <div className="lunch-content">
 <div className="lunch-emoji"></div>
 <h2 className="lunch-title">LUNCH BREAK</h2>
 <p className="lunch-time">1:00 PM — 2:00 PM</p>
 <p className="lunch-vibe">Recharge. Reconnect. Get ready for Round 2.</p>
 <div className="lunch-dots-row"><span></span><span></span><span></span><span></span><span></span></div>
 </div>
 </div>
 </section>

 {/* ── 8. TRIBE ARCADE ── */}
 <section className="section arcade-sec" id="arcade">
 <div className="arc-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num light-num" aria-hidden="true">08</div>
 <div className="sec-header">
 <h2 className="sec-title white-t">TRIBE ARCADE</h2>
 <p className="sec-sub light-sub">College-festival energy. Five stations. Zero chill.</p>
 </div>
 <div className="arcade-grid">
 <div className="arc-card" style={{ ['--ac' as any]: '#FFE600'}}>
 <div className="arc-screen"><span></span><span></span><span></span></div>
 <div className="arc-icon"></div>
 <h3>PUZZLE DROP</h3>
 <p>Think fast. Piece it together under pressure before time runs out.</p>
 </div>
 <div className="arc-card" style={{ ['--ac' as any]: '#00FFD1'}}>
 <div className="arc-screen"><span></span><span></span><span></span></div>
 <div className="arc-icon"></div>
 <h3>ONE MINUTE CREATOR</h3>
 <p>You have 60 seconds. Create something. Make it memorable.</p>
 </div>
 <div className="arc-card" style={{ ['--ac' as any]: '#FF6BDE'}}>
 <div className="arc-screen"><span></span><span></span><span></span></div>
 <div className="arc-icon"></div>
 <h3>EMOJI MOVIE</h3>
 <p>Decode the film from emojis alone. The ultimate pop culture IQ test.</p>
 </div>
 <div className="arc-card" style={{ ['--ac' as any]: '#6BFFA0'}}>
 <div className="arc-screen"><span></span><span></span><span></span></div>
 <div className="arc-icon"></div>
 <h3>MEMORY WALL</h3>
 <p>Remember everything. Forget nothing. Trust your mind completely.</p>
 </div>
 <div className="arc-card" style={{ ['--ac' as any]: '#FF8C42'}}>
 <div className="arc-screen"><span></span><span></span><span></span></div>
 <div className="arc-icon"></div>
 <h3>SILENT CHARADES</h3>
 <p>No sound. No words. Pure expression. Make your team guess.</p>
 </div>
 </div>
 </div>
 <div className="arc-wavy-bottom"></div>
 </section>

 {/* ── 9. THE IMPOSSIBLE CHALLENGE ── */}
 <section className="section impossible-sec" id="impossible">
 <div className="imp-bg"></div>
 <div className="section-inner imp-inner">
 <div className="sec-num light-num" aria-hidden="true">09</div>
 <div className="imp-content">
 <div className="imp-badge">LEVEL: IMPOSSIBLE</div>
 <h2 className="imp-title">THE<br/><em className="imp-word">IMPOSSIBLE</em><br/>CHALLENGE</h2>
 <p className="imp-desc">This is where legends are made and assumptions are destroyed. What you think you can't do — you'll do here. No shortcuts. No mercy. Just pure, unfiltered grit.</p>
 <div className="imp-stats">
 <div className="is"><span>1</span><p>Winner</p></div>
 <div className="is"><span>∞</span><p>Possibilities</p></div>
 <div className="is"><span>0</span><p>Excuses</p></div>
 </div>
 </div>
 <div className="imp-deco" aria-hidden="true">
 <div className="ir ir1"></div><div className="ir ir2"></div><div className="ir ir3"></div>
 <div className="istar is1d"></div>
 <div className="istar is2d"></div>
 <div className="istar is3d"></div>
 </div>
 </div>
 </section>

 {/* ── 10. TRIBE JAM ── */}
 <section className="section jam-sec" id="jam">
 <div className="jam-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">10</div>
 <div className="jam-header">
 <h2 className="sec-title jam-t">TRIBE JAM</h2>
 <p className="jam-sub">Music. Expression. Vibes. This is the beat of TRIBEVERSE.</p>
 </div>
 <div className="jam-layout">
 <div className="jam-visual">
 <div className="equalizer">
 <div className="eq-bar"></div><div className="eq-bar"></div>
 <div className="eq-bar"></div><div className="eq-bar"></div>
 <div className="eq-bar"></div><div className="eq-bar"></div>
 <div className="eq-bar"></div><div className="eq-bar"></div>
 <div className="eq-bar"></div><div className="eq-bar"></div>
 <div className="eq-bar"></div><div className="eq-bar"></div>
 </div>
 <div className="jnote jn1"></div><div className="jnote jn2"></div>
 <div className="jnote jn3"></div><div className="jnote jn4"></div>
 </div>
 <div className="jam-info">
 <div className="jd"><span className="ji"></span><div><strong>Performance Round</strong><p>Sing, rap, beatbox, hum — any expression of music counts here.</p></div></div>
 <div className="jd"><span className="ji"></span><div><strong>Team Vibe</strong><p>Your team's musical energy becomes your biggest advantage. Feel it together.</p></div></div>
 <div className="jd"><span className="ji"></span><div><strong>Music is Tribe Language</strong><p>No perfect pitch required. Just passion, rhythm, and your authentic self.</p></div></div>
 </div>
 </div>
 </div>
 <div className="jam-wavy-bottom"></div>
 </section>

 {/* ── 11. THE TRIBE WALL ── */}
 <section className="section wall-sec" id="wall">
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">11</div>
 <div className="wall-header">
 <h2 className="sec-title wall-t">THE TRIBE WALL</h2>
 <p className="wall-prompt">"BEFORE I GRADUATE, I WANT TO..."</p>
 <p className="wall-count">100 DREAMS ONE WALL</p>
 </div>
 <div className="wall-grid">
 {notes.map(note =>(
 <div
 key={note.id}
 className="sticky-note"
 style={{ ['--r' as any]: note.r, ['--c' as any]: note.c }}
 >
 {note.text}
 </div>
 ))}
 </div>
 <div className="wall-add">
 <p className="wall-add-label">Add your dream to the wall</p>
 <form onSubmit={addDream} className="wall-input-row">
 <input
 type="text"
 placeholder="Before I graduate, I want to..."
 maxLength={60}
 value={dreamInput}
 onChange={(e) =>setDreamInput(e.target.value)}
 aria-label="Type your dream"
 />
 <button type="submit">Pin It</button>
 </form>
 </div>
 </div>
 </section>

 {/* ── 12. TRIBEVERSE REVEAL ── */}
 <section className="section reveal-final" id="reveal">
 <div className="rf-bg"></div>
 <div className="rf-particles" aria-hidden="true">
 <span className="rfp p1"></span><span className="rfp p2">●</span>
 <span className="rfp p3"></span><span className="rfp p4">◆</span>
 <span className="rfp p5"></span><span className="rfp p6">●</span>
 <span className="rfp p7"></span><span className="rfp p8">◆</span>
 </div>
 <div className="section-inner rf-inner">
 <div className="sec-num light-num" aria-hidden="true">12</div>
 <div className="rf-header">
 <span className="rf-label">TRIBEVERSE REVEAL</span>
 </div>
 <div className="rf-lines">
 <p className="rf-line">YOU CAME IN AS STRANGERS.</p>
 <p className="rf-line">YOU PLAYED TOGETHER.</p>
 <p className="rf-line">YOU DISCOVERED EACH OTHER.</p>
 <p className="rf-line">YOU CHALLENGED YOURSELF.</p>
 <p className="rf-line">YOU LAUGHED.</p>
 <p className="rf-line">YOU LEARNED.</p>
 <p className="rf-line">AND SOMEWHERE ALONG THE WAY...</p>
 <p className="rf-line rf-highlight">YOU FOUND YOUR TRIBE.</p>
 </div>
 <div className="rf-divider"></div>
 <div className="rf-welcome show">
 <h2 className="rf-welcome-title">WELCOME TO TRIBEVERSE.</h2>
 <p className="rf-welcome-sub">YOUR JOURNEY STARTS HERE.</p>
 <div className="mb-8">
 <Link
 href="/register"
 className="hero-cta"
 >
 ENTER TRIBEVERSE PLATFORM →
 </Link>
 </div>
 <div className="rf-logo">
 <span className="rfl-st">st.</span>
 <span className="rfl-txt">Student Tribe</span>
 </div>
 </div>
 </div>
 </section>

 {/* ── FOOTER ── */}
 <footer className="footer">
 <div className="footer-wavy"></div>
 <div className="footer-inner">
 <div className="footer-logo">
 <span className="fl-st">st.</span>
 <span className="fl-txt">Student Tribe</span>
 </div>
 <div className="footer-event">
 <p>TRIBEVERSE V1 — FRESHERS EDITION</p>
 <p>20 Teams · 5 Members · 100 Participants</p>
 </div>
 <p className="footer-tag">Structure. Purpose. Teamwork.</p>
 </div>
 </footer>
 </div>
 )
}
