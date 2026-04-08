import React, { useState, useEffect } from 'react'
import './App.css'

const MONTH_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=900&q=80', label: 'Mountain Peak' },
  { url: 'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=900&q=80', label: 'Winter Fog' },
  { url: 'https://images.unsplash.com/photo-1490750967868-88df5691cc55?w=900&q=80', label: 'Spring Bloom' },
  { url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80', label: 'Cherry Blossom' },
  { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80', label: 'Forest Light' },
  { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=80', label: 'Summer Coast' },
  { url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&q=80', label: 'Alpine Trail' },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&q=80', label: 'Golden Fields' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80', label: 'Autumn Road' },
  { url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=900&q=80', label: 'Lake Reflection' },
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975864c?w=900&q=80', label: 'First Snow' },
  { url: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=900&q=80', label: 'Winter Solstice' },
]

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['MON','TUE','WED','THU','FRI','SAT','SUN']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function makeKey(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function splitKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

export default function App() {
  const today = new Date()

  const [curYear, setCurYear] = useState(today.getFullYear())
  const [curMonth, setCurMonth] = useState(today.getMonth())
  const [rangeStart, setRangeStart] = useState(null)
  const [rangeEnd, setRangeEnd] = useState(null)
  const [selecting, setSelecting] = useState(false)
  const [activeNote, setActiveNote] = useState(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDir, setFlipDir] = useState('next')
  const [imgLoaded, setImgLoaded] = useState(false)

  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cal_notes')) || {} } catch { return {} }
  })
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('cal_theme') || 'light' } catch { return 'light' }
  })

  const monthKey = `${curYear}-${curMonth}`

  useEffect(() => {
    try { localStorage.setItem('cal_notes', JSON.stringify(notes)) } catch {}
  }, [notes])

  useEffect(() => {
    try { localStorage.setItem('cal_theme', theme) } catch {}
  }, [theme])

  useEffect(() => {
    setActiveNote(null)
    setImgLoaded(false)
  }, [curMonth, curYear])

  function goMonth(dir) {
    if (isFlipping) return
    setFlipDir(dir > 0 ? 'next' : 'prev')
    setIsFlipping(true)
    setTimeout(() => {
      setCurMonth(m => {
        let next = m + dir
        if (next > 11) { next = 0; setCurYear(y => y + 1) }
        if (next < 0) { next = 11; setCurYear(y => y - 1) }
        return next
      })
      setRangeStart(null)
      setRangeEnd(null)
      setSelecting(false)
      setTimeout(() => setIsFlipping(false), 400)
    }, 350)
  }

  const days = getDaysInMonth(curYear, curMonth)
  const firstDay = getFirstDayOfMonth(curYear, curMonth)
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  function handleDayClick(day) {
    const key = makeKey(curYear, curMonth, day)
    if (!selecting || !rangeStart) {
      setRangeStart(key)
      setRangeEnd(null)
      setSelecting(true)
      setActiveNote(key)
    } else {
      const s = splitKey(rangeStart)
      const startTs = new Date(s.year, s.month, s.day)
      const clickTs = new Date(curYear, curMonth, day)
      if (clickTs < startTs) {
        setRangeStart(key)
        setRangeEnd(null)
        setSelecting(true)
        setActiveNote(key)
      } else {
        setRangeEnd(key)
        setSelecting(false)
        setActiveNote(key)
      }
    }
  }

  function handleDayHover(day) {
    if (selecting && rangeStart) {
      setRangeEnd(makeKey(curYear, curMonth, day))
    }
  }

  function isInRange(day) {
    if (!rangeStart || !rangeEnd) return false
    const ts = new Date(curYear, curMonth, day)
    const s = splitKey(rangeStart)
    const e = splitKey(rangeEnd)
    const sTs = new Date(s.year, s.month, s.day)
    const eTs = new Date(e.year, e.month, e.day)
    const lo = sTs <= eTs ? sTs : eTs
    const hi = sTs <= eTs ? eTs : sTs
    return ts > lo && ts < hi
  }

  function isRangeEdge(day, which) {
    const key = which === 'start' ? rangeStart : rangeEnd
    if (!key) return false
    const p = splitKey(key)
    return p.year === curYear && p.month === curMonth && p.day === day
  }

  function isToday(day) {
    return today.getFullYear() === curYear && today.getMonth() === curMonth && today.getDate() === day
  }

  function isWeekend(day) {
    const dow = (firstDay + (day - 1)) % 7
    return dow === 5 || dow === 6
  }

  function getActiveNoteText() {
    if (!activeNote) return ''
    if (activeNote === 'month') return notes[`month_${monthKey}`] || ''
    return notes[activeNote] || ''
  }

  function setActiveNoteText(val) {
    if (activeNote === 'month') {
      setNotes(n => ({ ...n, [`month_${monthKey}`]: val }))
    } else if (activeNote) {
      setNotes(n => ({ ...n, [activeNote]: val }))
    }
  }

  function clearSelection() {
    setRangeStart(null)
    setRangeEnd(null)
    setSelecting(false)
    setActiveNote(null)
  }

  function getRangeLabel() {
    if (!rangeStart) return ''
    if (!rangeEnd) {
      const s = splitKey(rangeStart)
      return `${MONTH_NAMES[s.month].slice(0,3)} ${s.day} · click another date to set range`
    }
    const s = splitKey(rangeStart)
    const e = splitKey(rangeEnd)
    const sTs = new Date(s.year, s.month, s.day)
    const eTs = new Date(e.year, e.month, e.day)
    const diff = Math.abs(Math.round((eTs - sTs) / 86400000)) + 1
    const lo = sTs <= eTs ? s : e
    const hi = sTs <= eTs ? e : s
    return `${MONTH_NAMES[lo.month].slice(0,3)} ${lo.day} → ${MONTH_NAMES[hi.month].slice(0,3)} ${hi.day} · ${diff} day${diff > 1 ? 's' : ''}`
  }

  const heroImg = MONTH_IMAGES[curMonth]
  const isDark = theme === 'dark'

  return (
    <div className={`app-root ${isDark ? 'dark' : ''}`}>
      <div className="wire-strip">
        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="wire-loop" />)}
      </div>

      <div className={`calendar-shell ${isFlipping ? `flip-${flipDir}` : ''}`}>
        <div className="hero-panel">
          <div className="hero-img-wrap">
            {!imgLoaded && <div className="img-skeleton" />}
            <img
              src={heroImg.url}
              alt={heroImg.label}
              className={`hero-img ${imgLoaded ? 'loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
            />
            <div className="hero-overlay" />
            <div className="hero-badge">
              <span className="hero-year">{curYear}</span>
              <span className="hero-month-label">{MONTH_NAMES[curMonth].toUpperCase()}</span>
            </div>
            <div className="hero-img-credit">{heroImg.label}</div>
          </div>

          <div className="notes-panel">
            <div className="notes-header">
              <button
                className={`notes-tab ${activeNote === 'month' ? 'active' : ''}`}
                onClick={() => setActiveNote('month')}
              >📅 Month Notes</button>
              {activeNote && activeNote !== 'month' && (
                <button className="notes-tab active">
                  📌 {(() => { const p = splitKey(activeNote); return `${MONTH_NAMES[p.month].slice(0,3)} ${p.day}` })()}
                </button>
              )}
            </div>
            {activeNote ? (
              <textarea
                className="notes-textarea"
                placeholder={
                  activeNote === 'month'
                    ? `Notes for ${MONTH_NAMES[curMonth]}…`
                    : `Note for ${(() => { const p = splitKey(activeNote); return `${MONTH_NAMES[p.month].slice(0,3)} ${p.day}` })()}…`
                }
                value={getActiveNoteText()}
                onChange={e => setActiveNoteText(e.target.value)}
              />
            ) : (
              <div className="notes-empty">
                <span>Click a date to add a note</span>
                <button className="notes-tab" style={{ marginTop: '0.75rem' }} onClick={() => setActiveNote('month')}>+ Month note</button>
              </div>
            )}
            {rangeStart && (
              <div className="range-info">
                <span className="range-label">{getRangeLabel()}</span>
                <button className="clear-btn" onClick={clearSelection}>✕ Clear</button>
              </div>
            )}
          </div>
        </div>

        <div className="grid-panel">
          <div className="grid-header">
            <div className="month-nav">
              <button className="nav-btn" onClick={() => goMonth(-1)} aria-label="Previous month">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <div className="month-title-wrap">
                <h1 className="month-title">{MONTH_NAMES[curMonth]}</h1>
                <span className="year-tag">{curYear}</span>
              </div>
              <button className="nav-btn" onClick={() => goMonth(1)} aria-label="Next month">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
            <div className="header-actions">
              <button className="icon-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Toggle theme">
                {isDark ? '☀️' : '🌙'}
              </button>
              <button className="icon-btn" onClick={() => { setCurYear(today.getFullYear()); setCurMonth(today.getMonth()) }} title="Go to today">
                Today
              </button>
            </div>
          </div>

          <div className="day-labels">
            {DAY_NAMES.map(d => (
              <div key={d} className={`day-label ${d === 'SAT' || d === 'SUN' ? 'weekend-label' : ''}`}>{d}</div>
            ))}
          </div>

          <div className="day-grid">
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="day-cell empty" />
              const classes = [
                'day-cell',
                isToday(day) && 'today',
                isRangeEdge(day, 'start') && 'range-start',
                isRangeEdge(day, 'end') && 'range-end',
                isInRange(day) && 'in-range',
                isWeekend(day) && 'weekend',
                notes[makeKey(curYear, curMonth, day)] && 'has-note',
              ].filter(Boolean).join(' ')
              return (
                <div
                  key={day}
                  className={classes}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => handleDayHover(day)}
                >
                  <span className="day-num">{day}</span>
                  {notes[makeKey(curYear, curMonth, day)] && <span className="note-dot" />}
                  {isToday(day) && <span className="today-ring" />}
                </div>
              )
            })}
          </div>

          <div className="grid-footer">
            <div className="legend">
              <span className="leg-item"><span className="leg-dot today-dot" />Today</span>
              <span className="leg-item"><span className="leg-dot range-dot" />Range</span>
              <span className="leg-item"><span className="leg-dot note-dot-leg" />Note</span>
            </div>
            <span className="footer-hint">{selecting ? 'Click end date' : 'Click date to select'}</span>
          </div>
        </div>
      </div>

      <div className="page-shadow" />
    </div>
  )
}