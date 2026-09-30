'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import './landing.css'
import TeamCard from '@/components/TeamCard'
import { TRIBE_TEAM_MEMBERS } from '@/lib/teamData'
import Icon from '@/components/icons/Icon'
import PlaybookSlideViewer from '@/components/PlaybookSlideViewer'

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
        <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <li><a href="#overview" className="nav-link" onClick={() => setMenuOpen(false)}>Overview</a></li>
          <li><a href="#schedule" className="nav-link" onClick={() => setMenuOpen(false)}>Itinerary</a></li>
          <li><Link href="/event-flow" className="nav-link text-[#00FFD1] font-bold" onClick={() => setMenuOpen(false)}>Live Cockpit ↗</Link></li>
          <li><a href="#team" className="nav-link text-[#FFE600] font-bold" onClick={() => setMenuOpen(false)}>Tribe Team</a></li>
          <li>
            <Link href="/login" className="nav-link nav-link-login" onClick={() => setMenuOpen(false)}>
              LOGIN
            </Link>
          </li>
          <li>
            <Link href="/register" className="nav-link nav-link-cta" onClick={() => setMenuOpen(false)}>
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
 <div className="hero-actions">
 <Link href="/register" className="hero-cta">
 ENTER TRIBEVERSE →
 </Link>
 <a href="#schedule" className="hero-cta-secondary">
 Explore Event Flow ↓
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
 <p className="sec-sub">TRIBEVERSE V1 is a student focused campus experience introducing freshers to Student Tribe through interaction, activities, talent, music and shared experiences.</p>
 </div>
 <div className="overview-grid">
 <div className="ov-card">
 <div className="ov-icon"><Icon name="globe" /></div>
 <h3>The Concept</h3>
 <p>An immersive day of real human connection where freshers step into interactive challenges, discover hidden strengths, and experience the energy of our community.</p>
 </div>
 <div className="ov-card">
 <div className="ov-icon"><Icon name="bolt" /></div>
 <h3>The Experience</h3>
 <p>From Inauguration and Talent Hunts to high-octane Playground rounds and Live Jams, every moment is built for memorable student participation.</p>
 </div>
 <div className="ov-card">
 <div className="ov-icon"><Icon name="heart" /></div>
 <h3>The Destination</h3>
 <p>You came as strangers. You played together. You shared dreams on the Tribe Wall. And somewhere along the way... you found your Tribe.</p>
 </div>
 </div>
 <div className="marquee-wrapper">
 <div className="marquee-track">
 <span>TRIBEVERSE V1</span><span className="mx"><Icon name="sparkle" /></span>
 <span>FRESHERS EDITION</span><span className="mx"><Icon name="sparkle" /></span>
 <span>CAMPUS EXPERIENCE</span><span className="mx"><Icon name="sparkle" /></span>
 <span>100+ STUDENTS</span><span className="mx"><Icon name="sparkle" /></span>
 <span>ONE DAY</span><span className="mx"><Icon name="sparkle" /></span>
 <span>FIND YOUR TRIBE</span><span className="mx"><Icon name="sparkle" /></span>
 <span>TRIBEVERSE V1</span><span className="mx"><Icon name="sparkle" /></span>
 <span>FRESHERS EDITION</span><span className="mx"><Icon name="sparkle" /></span>
 <span>OPEN PARTICIPATION</span><span className="mx"><Icon name="sparkle" /></span>
 <span>100+ STUDENTS</span><span className="mx"><Icon name="sparkle" /></span>
 </div>
 </div>
 </div>
 </section>

 {/* ── 3. FINAL EVENT FLOW (TIMESTAMP REMOVED) ── */}
 <section className="section schedule-sec" id="schedule">
 <div className="schedule-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num light-num" aria-hidden="true">03</div>
 <div className="sec-header">
 <h2 className="sec-title white-t">OFFICIAL ITINERARY</h2>
 <p className="sec-sub light-sub">Official TRIBEVERSE sequence from 9:30 AM to 3:30 PM</p>
 </div>
 <div className="schedule-table">
 <div className="srow srow-head">
 <div className="stime">TIME</div>
 <div className="sevent">SEGMENT & BRIEF</div>
 <div className="stype">FORMAT</div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#FFE600] font-bold">9:30 – 10:00 AM</div>
 <div className="sevent">
 <span className="sname"><Icon name="clapperboard" /> INAUGURATION</span>
 <span className="sdetail">Official opening of TRIBEVERSE and welcome to the participants.</span>
 </div>
 <div className="stype"><span className="sbadge sb-yellow">Launch</span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#00FFD1] font-bold">10:00 – 10:30 AM</div>
 <div className="sevent">
 <span className="sname"><Icon name="book" /> ST BRIEF</span>
 <span className="sdetail">Introduction to Student Tribe, its community and student opportunities.</span>
 </div>
 <div className="stype"><span className="sbadge sb-blue">Community</span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#FF6BDE] font-bold">10:30 – 11:00 AM</div>
 <div className="sevent">
 <span className="sname"><Icon name="sparkle" /> TALENT HUNT</span>
 <span className="sdetail">Open platform for students to showcase their talents and creative skills.</span>
 </div>
 <div className="stype"><span className="sbadge sb-purple">Talent</span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#FFE600] font-bold">11:00 AM – 12:00 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="game-controller" /> TRIBE PLAYGROUND</span>
 <span className="sdetail">Interactive activities focused on participation, creativity and quick thinking.</span>
 </div>
 <div className="stype"><span className="sbadge sb-pink">Playground</span></div>
 </div>
 <div className="srow srow-lunch">
 <div className="stime font-mono text-white/80 font-bold">12:00 – 1:00 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="pizza" /> LUNCH</span>
 <span className="sdetail">Break for lunch, relaxation and informal interaction among participants.</span>
 </div>
 <div className="stype"><span className="sbadge sb-green">Social</span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#00FFD1] font-bold">1:00 – 2:00 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="trophy" /> TRIBE PLAYGROUND CONTINUOUS</span>
 <span className="sdetail">Continuation of Playground activities and completion of remaining participation.</span>
 </div>
 <div className="stype"><span className="sbadge sb-teal">Challenges</span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#FF6B1A] font-bold">2:00 – 3:00 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="piano" /> TRIBE JAM</span>
 <span className="sdetail">Open music and performance session featuring students and participants.</span>
 </div>
 <div className="stype"><span className="sbadge sb-orange">Music</span></div>
 </div>
 <div className="srow srow-final">
 <div className="stime font-mono text-[#FFE600] font-bold">3:00 – 3:20 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="globe" /> TRIBEVERSE REVEAL</span>
 <span className="sdetail">Closing reveal connecting the day's experiences with the TRIBEVERSE identity.</span>
 </div>
 <div className="stype"><span className="sbadge sb-glow">REVEAL <Icon name="fire" /></span></div>
 </div>
 <div className="srow">
 <div className="stime font-mono text-[#00FFD1] font-bold">3:20 – 3:30 PM</div>
 <div className="sevent">
 <span className="sname"><Icon name="brick" /> TRIBE WALL</span>
 <span className="sdetail">Participants share a goal, thought or aspiration as a collective closing activity.</span>
 </div>
 <div className="stype"><span className="sbadge sb-yellow">Closing Wall</span></div>
 </div>
 </div>
 </div>
      <div className="schedule-wavy-bottom"></div>
    </section>

    {/* ── 4. THE STUDENT TRIBE ECOSYSTEM ── */}
    <section className="section ecosystem-sec" id="ecosystem" style={{ background: '#1A6FFF', color: '#FFF' }}>
      <div className="section-inner">
        <div className="sec-num light-num" aria-hidden="true">04</div>
        <div className="sec-header">
          <h2 className="sec-title yellow-t">OUR 6 TRIBE DIVISIONS</h2>
          <p className="sec-sub light-sub">Structure. Purpose. Teamwork | Student Tribe Playbook</p>
        </div>

        {/* Slide By Slide Playbook Deck */}
        <div className="mb-12">
          <PlaybookSlideViewer />
        </div>

        {/* 6 Divisions Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[#FF1A75] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#FFE600] block">1. CAREERS</span>
            <p className="text-xs text-white/90 font-medium mt-1">ST School skill development, upskilling, mentorship.</p>
          </div>

          <div className="bg-[#7B2FFF] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#00FFD1] block">2. COMMERCE</span>
            <p className="text-xs text-white/90 font-medium mt-1">Swiggy, Uber, Duolingo, SBI brand collaborations.</p>
          </div>

          <div className="bg-[#FF5500] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#FFE600] block">3. COMMUNITY</span>
            <p className="text-xs text-white/90 font-medium mt-1">Campus chapters, regional teams, active engagement.</p>
          </div>

          <div className="bg-[#FFE600] text-black p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#7B2FFF] block">4. CONTENT</span>
            <p className="text-xs text-black/80 font-bold mt-1">Media decks, viral reels, articles &amp; movie marketing.</p>
          </div>

          <div className="bg-[#4F26E9] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#D4FF00] block">5. CARE</span>
            <p className="text-xs text-white/90 font-medium mt-1">Mental health, well-being sessions, safe listener spaces.</p>
          </div>

          <div className="bg-[#FF2D55] p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <span className="font-display font-black text-lg text-[#FFE600] block">6. CLOTHING</span>
            <p className="text-xs text-white/90 font-medium mt-1">Beast collections, graphic streetwear &amp; design platform.</p>
          </div>
        </div>
      </div>
    </section>

 {/* ── 4. INAUGURATION ── */}
 <section className="section inaug-sec" id="inauguration">
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">04</div>
 <div className="inaug-layout">
 <div className="inaug-text">
 <h2 className="sec-title lime-t">INAUGURATION</h2>
 <p className="inaug-desc">Every great story has a beginning. TRIBEVERSE begins with a declaration as 100+ freshers step into something larger than themselves. Today is the day your tribe is born.</p>
 <div className="inaug-details">
            <div className="idetail"><span className="ilabel">PHASE</span><span className="ival">Stage 01 · Launch</span></div>
            <div className="idetail"><span className="ilabel">FORMAT</span><span className="ival">Opening Ceremony</span></div>
            <div className="idetail"><span className="ilabel">ATTENDANCE</span><span className="ival">500 to 600 Participants</span></div>
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
 <p>Sketch it fast. Make everyone guess it faster. Every second counts.</p>
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
 <div className="clue"><span className="cl-icon"></span><div><strong>Evidence Analysis</strong><p>Every detail matters. The truth is in the evidence if you know where to look.</p></div></div>
 <div className="clue"><span className="cl-icon"></span><div><strong>Time Pressure</strong><p>The clock is ticking. Can your detective instincts keep up?</p></div></div>
 </div>
 </div>
 <blockquote className="det-quote">"Every tribe has a detective.<br/>Today, yours will be tested."</blockquote>
 </div>
 </div>
 </section>

 {/* ── 7. LUNCH BREAK ── */}
 <section className="section lunch-sec" id="lunch">
 <div className="lunch-inner">
 <div className="lunch-content">
        <div className="lunch-emoji"><Icon name="pizza" className="w-[1em] h-[1em]" /></div>
        <h2 className="lunch-title">LUNCH &amp; FREE TRIBE TIME</h2>
        <p className="lunch-time text-sm uppercase tracking-wider font-bold text-[#FFE600]">Eat → Talk → Meet New People → Photos → Music → Explore</p>
        <p className="lunch-vibe">Recharge. Reconnect. Discover your tribe.</p>
 <div className="lunch-dots-row"><span></span><span></span><span></span><span></span><span></span></div>
 </div>
 </div>
 </section>

 {/* ── 8. TRIBE JAM ── */}
 <section className="section jam-sec" id="jam">
 <div className="jam-wavy-top"></div>
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">08</div>
 <div className="jam-header">
 <h2 className="sec-title jam-t">TRIBE JAM</h2>
 <p className="jam-sub">Pure Jamming Session: Live Keyboard, Singing, Dance & Unfiltered Beats.</p>
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
 <div className="jd"><span className="ji"></span><div><strong>Live Keyboard & Instrumental Jam</strong><p>Live keyboard playing leads the session, laying down chords and rhythms for everyone to join in.</p></div></div>
 <div className="jd"><span className="ji"></span><div><strong>Singing, Rap & Beatbox</strong><p>Sing, rap, beatbox, hum: any vocal expression counts. Take the mic or harmonize with the crowd.</p></div></div>
 <div className="jd"><span className="ji"></span><div><strong>Dance & Pure Jam Vibe</strong><p>Dance, movement, and freestyle rhythm. No perfect pitch or steps required, just authentic energy.</p></div></div>
 </div>
 </div>
 </div>
 <div className="jam-wavy-bottom"></div>
 </section>

 {/* ── 9. THE TRIBE WALL ── */}
 <section className="section wall-sec" id="wall">
 <div className="section-inner">
 <div className="sec-num" aria-hidden="true">09</div>
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

 {/* ── 10. TRIBE LEADERSHIP & SQUAD (HOVER SHOWCASE) ── */}
 <section className="section py-20 px-4 relative z-10 max-w-7xl mx-auto w-full" id="team">
 <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
 <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FFE600]/15 border border-[#FFE600]/30 text-[#FFE600] rounded-full text-xs font-black uppercase tracking-widest font-display">
 <Icon name="sparkle" /> THE SQUAD BEHIND TRIBEVERSE
 </span>
 <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white font-display">
 MEET THE <span className="text-[#FFE600]">TRIBE TEAM</span>
 </h2>
 <p className="text-white/60 text-xs sm:text-sm max-w-xl mx-auto">
 Official Student Tribe ambassadors leading the TRIBEVERSE experience at ANITS.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 {TRIBE_TEAM_MEMBERS.map((member) => (
 <TeamCard key={member.id} member={member} />
 ))}
 </div>

 <div className="text-center mt-10">
 <Link
 href="/team"
 className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider font-display transition-all hover:scale-105"
 >
 <span>View Full Team Directory & Connect</span>
 <span>→</span>
 </Link>
 </div>
 </section>

 {/* ── 11. TRIBEVERSE REVEAL ── */}
 <section className="section reveal-final" id="reveal">
 <div className="rf-bg"></div>
 <div className="rf-particles" aria-hidden="true">
 <span className="rfp p1"></span><span className="rfp p2">●</span>
 <span className="rfp p3"></span><span className="rfp p4">◆</span>
 <span className="rfp p5"></span><span className="rfp p6">●</span>
 <span className="rfp p7"></span><span className="rfp p8">◆</span>
 </div>
 <div className="section-inner rf-inner">
 <div className="sec-num light-num" aria-hidden="true">10</div>
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
 <p>TRIBEVERSE V1 · FRESHERS EDITION</p>
 </div>
 <p className="footer-tag">Structure. Purpose. Teamwork.</p>
 </div>
 </footer>
 </div>
 )
}
