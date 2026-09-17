import { useMemo, useState } from 'react'
import {
  Activity, BarChart3, Bell, Box, ChevronDown, CircleHelp, CreditCard,
  FileText, Gauge, Gift, Home, Inbox, Landmark, LifeBuoy, Menu,
  MessageSquare, MoreHorizontal, Package, PanelLeftClose, ReceiptText,
  Search, Settings, SlidersHorizontal, Sparkles, Users, X, Zap,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import './App.css'

const navItems = [
  { icon: Home, label: 'Home' },
  { icon: Users, label: 'Customers' },
  { icon: Package, label: 'Subscriptions' },
  { icon: ReceiptText, label: 'Invoices & Credit Notes' },
  { icon: FileText, label: 'Quotes' },
  { icon: Box, label: 'Product Catalog' },
  { icon: Gauge, label: 'Usage', badge: 'NEW' },
  { icon: CreditCard, label: 'Entitlements' },
  { icon: Landmark, label: 'Logs' },
  { icon: Activity, label: 'RevenueStory', badge: 'NEW' },
  { icon: Gift, label: 'Revenue Recognition' },
  { icon: Inbox, label: 'Classic Reports' },
]

const baseLabels = ['Aug 3', 'Aug 7', 'Aug 11', 'Aug 15', 'Aug 19', 'Aug 23', 'Aug 27', 'Sep 1', 'Sep 5', 'Sep 9', 'Sep 13']

const chartValues = {
  billings: [38, 72, 28, 53, 18, 91, 24, 47, 35, 82, 21, 42, 18, 57, 31, 70, 18, 40, 23, 77, 35, 16, 53, 31, 28, 67, 21, 75],
  newBilling: [67, 37, 65, 22, 48, 53, 21, 17, 72, 24, 31, 92, 21, 38, 44, 16, 81, 27, 18, 35, 71, 24, 13, 31, 19, 11, 26, 15],
  payments: [34, 79, 23, 48, 42, 15, 71, 31, 23, 58, 35, 18, 38, 51, 27, 72, 31, 19, 55, 24, 21, 62, 19, 27, 29, 31, 32, 33],
  refunds: [0, 2, 0, 0, 0, 0, 8, 0, 0, 0, 31, 0, 0, 0, 0, 17, 0, 0, 7, 0, 0, 0, 4, 0, 0, 2, 0, 0],
  mrr: [8, 10, 13, 15, 19, 22, 25, 27, 31, 34, 36, 39, 41, 45, 48, 50, 53, 57, 61, 64, 68, 71, 74, 77, 78, 79, 81, 81],
  cmrr: [9, 12, 15, 18, 22, 26, 30, 33, 36, 40, 45, 43, 50, 52, 57, 60, 63, 67, 71, 78, 83, 87, 92, 104, 105, 106, 122, 124],
  signups: [43, 28, 47, 21, 38, 101, 22, 17, 59, 31, 49, 28, 34, 52, 35, 64, 61, 33, 27, 42, 29, 56, 44, 37, 52, 41, 55, 48],
  activations: [62, 31, 69, 22, 43, 35, 18, 74, 29, 21, 95, 18, 42, 29, 77, 23, 15, 70, 68, 31, 52, 19, 28, 40, 23, 51, 57, 38],
  churn: [0, 4, 0, 2, 0, 1, 3, 8, 3, 1, 0, 2, 4, 0, 1, 3, 0, 4, 1, 2, 0, 1, 3, 2, 4, 1, 3, 2],
  credits: [0, 7, 0, 4, 0, 0, 39, 0, 0, 0, 17, 0, 0, 13, 0, 8, 0, 10, 0, 8, 0, 4, 0, 5, 3, 4, 2, 2],
}

const metricCards = [
  { title: 'Total Billings', value: '$47.26K', comparison: 'Aug $52.61K', data: 'billings', legend: 'Total Billing' },
  { title: 'Total New Billing', value: '$3.16K', comparison: 'Aug $8.11K', data: 'newBilling', legend: 'Total New Billing' },
  { title: 'Total Payments', value: '$43.26K', comparison: 'Aug $49.76K', data: 'payments', legend: 'Total Payments' },
  { title: 'Total Refunds', value: '$382', comparison: 'Aug $190', data: 'refunds', legend: 'Total Refunds' },
  { title: 'Total MRR', value: '$84.92K', comparison: 'Aug $83.02K', data: 'mrr', legend: 'Total MRR' },
  { title: 'Total CMRR', value: '$85.49K', comparison: 'Aug $85.59K', data: 'cmrr', legend: 'Total CMRR' },
  { title: 'Total Signups', value: '744', comparison: 'Aug 1,404', data: 'signups', legend: 'Total Signups' },
  { title: 'Total Activations', value: '89', comparison: 'Aug 118', data: 'activations', legend: 'Total Activations' },
  { title: 'Total Subscription Churn Rate', value: '3.0%', comparison: 'Aug 2.5%', data: 'churn', legend: 'Total Subscription Churn Rate' },
  { title: 'Total Credit Notes Amount', value: '$480', comparison: 'Aug $996', data: 'credits', legend: 'Total Credit Notes Amount' },
]

function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark">cb</span><span>billing</span></div>
      <div className="trial-row"><Zap size={13} /> Usage billing <span>Trial</span></div>
      <button className="site-picker">
        <span className="site-avatar">U</span>
        <span><b>usagebilling-t...</b><small>Aishwarya Nemi</small></span>
        <ChevronDown size={13} />
      </button>
      <button className="global-search"><Search size={15} /><span>Go to</span><kbd>⌘ K</kbd></button>
      <nav>
        {navItems.map(({ icon: Icon, label, badge }) => (
          <button key={label} className={label === 'Home' ? 'active' : ''}>
            <Icon size={15} /><span>{label}</span>{badge && <em>{badge}</em>}
            {['Product Catalog', 'Usage', 'Entitlements', 'Revenue Recognition'].includes(label) && <ChevronDown className="chevron" size={12} />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="selected"><BarChart3 size={15} />Custom report assistant</button>
        <button><CircleHelp size={15} />What&apos;s new</button>
        <button><LifeBuoy size={15} />Need help?</button>
        <button className="profile"><span>AN</span><span><b>Aishwarya Nemi</b><small>aishwarya.nemi@...</small></span><MoreHorizontal size={14} /></button>
      </div>
      <button className="close-sidebar" onClick={onClose}><PanelLeftClose size={18} /></button>
    </aside>
  )
}

function MetricChart({ metric }) {
  const data = useMemo(() => chartValues[metric.data].map((value, index) => ({
    name: baseLabels[Math.floor(index / 2.8)] || 'Sep 13',
    value,
  })), [metric.data])

  return (
    <article className="chart-card">
      <div className="chart-heading">
        <div><h3>{metric.title}</h3><p><strong>{metric.value}</strong> <span>{metric.comparison}</span></p></div>
        <div className="chart-actions"><CircleHelp size={14} /><MoreHorizontal size={15} /></div>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${metric.data}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84c8f5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#84c8f5" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#edf1f4" />
            <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} tick={{ fill: '#9aa5ad', fontSize: 9 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a4aeb5', fontSize: 9 }} width={30} />
            <Tooltip contentStyle={{ border: '1px solid #dfe6ea', borderRadius: 6, fontSize: 11 }} />
            <Area type="linear" dataKey="value" stroke="#5eb4ec" strokeWidth={1.2} fill={`url(#fill-${metric.data})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="legend"><i />{metric.legend}</div>
    </article>
  )
}

function App() {
  const [bannerVisible, setBannerVisible] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [range, setRange] = useState('Daily')

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="page">
        <div className="preview-bar">TEST SITE — Switch to live site when you&apos;re ready</div>
        <header>
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="header-spacer" />
          <button className="product-button">Take Me to Product Page!</button>
          <button className="icon-button"><Bell size={16} /></button>
          <button className="icon-button"><Settings size={16} /></button>
        </header>

        <main>
          {bannerVisible && (
            <section className="learning-banner">
              <div><Sparkles size={16} /> Learn how to launch usage-based pricing</div>
              <button className="video-button">▶ Watch Video (02:12)</button>
              <button className="select-button">more content <ChevronDown size={12} /></button>
              <button className="dismiss" onClick={() => setBannerVisible(false)}><X size={16} /></button>
            </section>
          )}

          <div className="test-notice"><Zap size={14} /> You&apos;re seeing sample data on the Test Site. Switch to the Live Site for real insights.</div>

          <section className="stats-row">
            {[
              ['Total MRR', '$84,920'],
              ['Total Active Subscriptions', '1,702'],
              ['Net Billing', '$198,805'],
              ['Net Payments', '$194,800'],
              ['Unpaid Invoices', '80', 'invoices'],
            ].map(([label, value, suffix]) => (
              <div className="stat" key={label}><span>{label}<CircleHelp size={12} /></span><strong>{value}</strong>{suffix && <small>{suffix}</small>}</div>
            ))}
          </section>

          <div className="controls">
            <div className="segmented">
              {['Daily', 'Weekly', 'Monthly', 'Quarterly'].map(item => <button className={range === item ? 'active' : ''} onClick={() => setRange(item)} key={item}>{item}</button>)}
            </div>
            <button className="date-select">Aug 3 - Sep 13 <ChevronDown size={12} /></button>
            <button className="filter-button"><SlidersHorizontal size={14} /> Filters</button>
          </div>

          <section className="charts-grid">
            {metricCards.map(metric => <MetricChart key={metric.title} metric={metric} />)}
          </section>
          <footer><a href="#">Privacy</a><a href="#">Terms</a></footer>
        </main>
        <button className="assistant"><MessageSquare size={18} /></button>
      </div>
      {sidebarOpen && <button aria-label="Close navigation" className="overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default App
