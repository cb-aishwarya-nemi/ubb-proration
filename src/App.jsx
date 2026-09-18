import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, ArrowDown, ArrowUp, ArrowUpRight, BarChart3, Box, ChevronDown, ChevronRight, CircleHelp, Columns3, CreditCard,
  Code2, Copy, Eye, FileText, Gauge, Gift, Home, Inbox, Info, Landmark, LifeBuoy, Link2, ListFilter, Menu,
  MessageSquare, MoreHorizontal, Package, PanelLeftClose, Paperclip, Pencil, Plus, ReceiptText,
  Search, SlidersHorizontal, Sparkles, Users, X, Zap, Globe2,
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
  { icon: Gauge, label: 'Usages', badge: 'NEW' },
  { icon: CreditCard, label: 'Entitlements' },
  { icon: Landmark, label: 'Logs' },
  { icon: Activity, label: 'RevenueStory', badge: 'NEW' },
  { icon: Gift, label: 'Revenue Recognition' },
  { icon: Inbox, label: 'Classic Reports' },
]

const catalogNavLabels = ['Home', 'Customers', 'Subscriptions', 'Invoices & Credit Notes', 'Quotes', 'Product Catalog', 'Usages', 'Entitlements']
const expandableNavLabels = ['Invoices & Credit Notes', 'Product Catalog', 'Usages', 'Entitlements', 'Revenue Recognition']

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

const plans = [
  ['abc', 'abc', 'Testing', '10-Nov-2025 11:43'],
  ['Advanced Plan', 'Advanced-Plan', 'API fam', '11-Nov-2025 11:39'],
  ['ai suite', 'ai-suite', 'Artlist', '18-Nov-2025 16:07'],
  ['AI Suite Artlist', 'AI-Suite-Artlist', 'API fam', '01-Dec-2025 14:56'],
  ['AI Suite Monthly', 'AI-Suite-Monthly', 'Artlist', '04-Oct-2025 02:11'],
  ['AI Suite Plan', 'AI-Suite-Plan', 'Artlist', '15-Mar-2026 23:16'],
  ['API plan', 'API-plan', 'API fam', '10-Oct-2025 11:58'],
  ['Basic', 'Basic', 'Testing', '08-Oct-2025 17:17'],
  ['Basic Plan', 'Basic-Plan', 'API fam', '11-Nov-2025 11:38'],
  ['Enterprise', 'Enterprise', 'Testing', '14-Nov-2025 10:28'],
]

function Sidebar({ open, onClose, pageView, onNavigate }) {
  const catalogView = pageView === 'plans' || pageView === 'planDetails' || pageView === 'itemPrice'
  const [catalogOpen, setCatalogOpen] = useState(catalogView)

  const priceSite = pageView === 'planDetails' || pageView === 'itemPrice'

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('dashboard')}><span className="brand-mark" aria-hidden /><span>Billing</span><ChevronRight size={14} /></button>
      <button className="site-picker">
        <span className="site-avatar"><Globe2 size={12} /></span>
        <span><b>{priceSite ? 'beelieve-2025...' : 'usagebilling'}</b><small>{priceSite ? 'beelieve-2025-ubb-test...' : 'usagebilling-test.chargeb...'}</small></span>
        <span className="test-tag">Test</span>
        <ChevronRight size={13} />
      </button>
      {!priceSite && <button className="site-picker timezone">
        <Globe2 size={13} />
        <span><b>usagebilling-t...</b><small>Asia/Calcutta (IST)</small></span>
        <span className="site-tag">Site</span>
        <ChevronRight size={13} />
      </button>}
      {pageView !== 'plans' && <button className="global-search"><Search size={13} /><span>Go to</span><kbd>⌘ K</kbd></button>}
      <nav>
        {navItems.filter(({ label }) => !catalogView || catalogNavLabels.includes(label)).map(({ icon: Icon, label, badge }) => (
          <div className="nav-group" key={label}>
          <button
            className={label === 'Home' && pageView === 'dashboard' ? 'active' : ''}
            onClick={() => {
              if (label === 'Product Catalog') setCatalogOpen(value => !value)
              if (label === 'Home') onNavigate('dashboard')
              if (label === 'Subscriptions') onNavigate('subscriptions')
            }}
          >
            <Icon size={15} /><span>{label}</span>{badge && <em>{badge}</em>}
            {expandableNavLabels.includes(label) && <ChevronDown className={`chevron ${label === 'Product Catalog' && catalogOpen ? 'up' : ''}`} size={12} />}
          </button>
          {label === 'Product Catalog' && catalogOpen && (
            <div className="catalog-menu">
              {['Product Families', 'Plans', 'Addons', 'Charges', 'Price Variants', 'Coupons', 'Coupon Sets'].map(item => (
                <button key={item} className={item === 'Plans' && catalogView ? 'active' : ''} onClick={() => item === 'Plans' && onNavigate('plans')}>{item}</button>
              ))}
            </div>
          )}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="selected"><BarChart3 size={15} />Catalog Setup Assistant</button>
        <button><CircleHelp size={15} />What&apos;s new<ArrowUpRight className="trailing" size={13} /></button>
        <button><LifeBuoy size={15} />Need Help?<MoreHorizontal className="trailing" size={14} /></button>
        <button className="profile"><span>AN</span><span><b>Aishwarya Nemi</b><small>aishwarya.nemi@...</small></span><MoreHorizontal size={14} /></button>
      </div>
      <button className="close-sidebar" onClick={onClose}><PanelLeftClose size={18} /></button>
    </aside>
  )
}

function PlansPage({ onSelectPlan }) {
  return (
    <div className="plans-page">
      <div className="plans-toolbar">
        <div className="plans-toolbar-top">
          <span className="filter-list"><SlidersHorizontal size={13} /> Filter list</span>
          <div className="plans-actions">
            <button className="import-button">Import Plans</button>
            <button className="create-button"><Plus size={14} /> Create Plan</button>
          </div>
        </div>
        <div className="plans-toolbar-bottom">
          <label className="plans-search"><Search size={14} /><input placeholder="Search for ID / Name" /></label>
          <button className="sort-button">Sort by <ChevronDown size={12} /></button>
          <button className="view-button" aria-label="Table display options"><Columns3 size={13} /><ChevronDown size={10} /></button>
        </div>
      </div>
      <div className="plans-content">
        <div className="plans-table">
          <div className="plan-row plan-head">
            <div>Plan <ArrowDown size={13} /></div>
            <div>Product Family</div>
            <div>Display in checkout</div>
            <div>Display in self-serve portal</div>
            <div>Last modified <ArrowDown size={13} /></div>
            <div />
          </div>
          {plans.map(plan => {
            const [name, id, family, modified] = plan
            return (
            <div className="plan-row plan-row-clickable" key={id} onClick={() => onSelectPlan(plan)} role="link" tabIndex={0} onKeyDown={event => event.key === 'Enter' && onSelectPlan(plan)}>
              <button className="plan-name plan-open" onClick={() => onSelectPlan(plan)}><span className="active-pill">ACTIVE</span><span><b>{name}</b><small>{id}</small></span></button>
              <div>{family}</div>
              <div>Yes</div>
              <div>Yes</div>
              <div>{modified}</div>
              <button aria-label={`More options for ${name}`} onClick={event => event.stopPropagation()}><MoreHorizontal size={17} /></button>
            </div>
          )})}
        </div>
      </div>
    </div>
  )
}

const catalogFeatures = [
  { name: 'API Hits updated', type: 'Feature', metered: true },
  { name: 'Muse', type: 'Feature', metered: true },
  { name: 'quantity test', type: 'Feature', metered: true },
  { name: 'Admin seats', type: 'Feature', metered: false },
  { name: 'SSO', type: 'Feature', metered: false },
  { name: 'Priority Support', type: 'Feature', metered: false },
]

function defaultWeights() {
  const metered = catalogFeatures.filter(feature => feature.metered)
  const baseWeight = Number((100 / metered.length).toFixed(2))
  return Object.fromEntries(catalogFeatures.map(feature => {
    if (!feature.metered) return [feature.name, 0]
    const index = metered.findIndex(item => item.name === feature.name)
    const weight = index === metered.length - 1 ? Number((100 - baseWeight * (metered.length - 1)).toFixed(2)) : baseWeight
    return [feature.name, weight]
  }))
}

function singleFeatureWeights(featureName) {
  return Object.fromEntries(catalogFeatures.map(feature => [feature.name, feature.metered && feature.name === featureName ? 100 : 0]))
}

const firstMeteredFeature = catalogFeatures.find(feature => feature.metered).name

const pricingRows = [
  ['Daily', '', '', '', ''],
  ['Weekly', '', '', '', ''],
  ['Every 10 days', 'Flat Fee', '$60.000 USD', 'Fixed', 'No trial'],
  ['Monthly', '', '', '', ''],
  ['Every 3 months', '', '', '', ''],
  ['Yearly', '', '', '', ''],
]

function PlanDetails({ plan, onBack, onOpenPrice }) {
  const [name, id] = plan
  return (
    <div className="plan-details-page">
      <div className="details-breadcrumb">
        <button onClick={onBack}>All Plans</button><span>›</span><span>Family <b>Chargebee Retention</b></span>
      </div>
      <div className="details-content">
        <section className="details-summary">
          <div className="details-title">
            <h1>{name}</h1><span className="details-active">Active</span><small>Last modified 09-Sep-2025 16:12</small>
          </div>
          <div className="details-actions"><button>Edit</button><button>Archive</button></div>
          <div className="detail-field"><span>ID</span><b>{id}</b></div>
          <div className="detail-field"><span>Display in Checkout</span><b>Yes</b></div>
          <div className="detail-field"><span>Display in Self-Serve Portal</span><b>Yes</b></div>
          <div className="detail-field"><span>JSON Metadata</span><a href="#">Add</a></div>
          <div className="detail-field"><span>Last modified</span><b>09-Sep-2025 16:12</b></div>
          <div className="detail-field"><span>Channel</span><b>Web</b></div>
          <div className="detail-field"><span>Metered</span><b>No</b></div>
        </section>

        <section className="pricing-card">
          <div className="pricing-toolbar">
            <h2>Pricing <CircleHelp size={12} /></h2>
            <button className="pricing-filter">All <ChevronDown size={11} /></button>
            <button className="how-to">▷ How to</button>
          </div>
          <div className="pricing-row pricing-head">
            <div>Currency <ArrowUp size={10} /><ListFilter size={10} /></div>
            <div>Frequency <ListFilter size={10} /></div>
            <div>Pricing Model <ListFilter size={10} /></div>
            <div>Price <ListFilter size={10} /></div>
            <div>Billing Cycle <ListFilter size={10} /></div>
            <div>Trial <ListFilter size={10} /></div>
            <div>Preview <CircleHelp size={11} /></div>
          </div>
          {pricingRows.map(([frequency, model, price, cycle, trial], index) => (
            <div className={`pricing-row ${frequency === 'Every 10 days' ? 'pricing-row-clickable' : ''}`} key={frequency} onClick={() => frequency === 'Every 10 days' && onOpenPrice()}>
              <div className="currency"><span className="us-flag">🇺🇸</span> USD</div>
              <div>{frequency === 'Every 10 days' ? <button className="frequency-link" onClick={event => { event.stopPropagation(); onOpenPrice() }}>{frequency}</button> : frequency}</div>
              <div>{model}</div>
              <div>{price || <button className="set-price" onClick={event => event.stopPropagation()}>Set Price</button>}</div>
              <div>{cycle}</div>
              <div>{trial}</div>
              <div className="preview-actions" onClick={event => event.stopPropagation()}>
                {index === 2 && <><Eye size={13} /><Copy size={13} /><Link2 size={13} /></>}
                {index === 2 && <MoreHorizontal className="price-more" size={15} />}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

function ItemPricePage({ plan, onBack, onAllPlans }) {
  const [name, id] = plan
  const priceId = `${id}-USD-Every-10-d...`
  const itemPrice = 60
  const weightageItems = catalogFeatures.filter(feature => feature.metered)
  const [weights, setWeights] = useState(defaultWeights)
  const [weightMode, setWeightMode] = useState('equal')
  const [singleFeature, setSingleFeature] = useState(firstMeteredFeature)
  const [weightageOpen, setWeightageOpen] = useState(false)
  const [draftWeights, setDraftWeights] = useState(defaultWeights)
  const [draftMode, setDraftMode] = useState('equal')
  const [draftFeature, setDraftFeature] = useState(firstMeteredFeature)
  const formatMoney = value => `$${value.toFixed(3)}`
  const amountFor = weight => Number(((itemPrice * weight) / 100).toFixed(3))
  const applyDraftMode = (mode, featureName = draftFeature) => {
    setDraftMode(mode)
    setDraftFeature(featureName)
    setDraftWeights(mode === 'single' ? singleFeatureWeights(featureName) : defaultWeights())
  }
  const openWeightage = () => {
    setDraftWeights(weights)
    setDraftMode(weightMode)
    setDraftFeature(singleFeature)
    setWeightageOpen(true)
  }
  const saveWeightage = () => {
    setWeightMode(draftMode)
    setSingleFeature(draftFeature)
    setWeights({
      ...Object.fromEntries(Object.entries(draftWeights).map(([name, value]) => [name, Number(value) || 0])),
      ...Object.fromEntries(catalogFeatures.filter(feature => !feature.metered).map(feature => [feature.name, 0])),
    })
    setWeightageOpen(false)
  }
  const draftTotal = catalogFeatures
    .filter(feature => feature.metered)
    .reduce((sum, feature) => sum + Number(draftWeights[feature.name] || 0), 0)
  return (
    <div className="item-price-page">
      <div className="details-breadcrumb">
        <button onClick={onAllPlans}>All Plans</button>
        <span>›</span>
        <span>Family <b>Chargebee Retention</b></span>
        <span>›</span>
        <button onClick={onBack}>Plan {name}</button>
      </div>
      <div className="item-price-content">
        <section className="item-card item-hero">
          <span className="details-active">Active</span>
          <div className="item-hero-head">
            <h1><span className="hero-plan">&apos;{name}&apos;</span> USD, Every 10 days</h1>
            <div className="details-actions item-hero-actions"><button>Edit</button><button>Delete</button></div>
          </div>
          <div className="item-id"><Pencil size={11} /><span>{priceId}</span><Copy size={12} /></div>
          <h2>Pricing</h2>
          <dl className="item-fields">
            <div><dt>Price</dt><dd>{formatMoney(itemPrice)} USD</dd></div>
            <div><dt>Pricing model</dt><dd>Flat Fee</dd></div>
            <div><dt>Free Quantity</dt><dd>0</dd></div>
            <div><dt>Billing cycles</dt><dd>1</dd></div>
            <div><dt>Channel</dt><dd>web</dd></div>
            <div><dt>JSON Metadata</dt><dd><a href="#">Add</a></dd></div>
          </dl>
        </section>

        <section className="item-card">
          <div className="item-card-head">
            <h2>Plan price point details</h2>
            <button>Update</button>
          </div>
          <dl className="item-fields">
            <div><dt>Internal name</dt><dd>{name} USD Every 10 days</dd></div>
            <div><dt>Taxable</dt><dd>Yes</dd></div>
          </dl>
        </section>

        <section className="item-card">
          <div className="item-card-head">
            <h2>Customer-Facing Info</h2>
            <button>Update</button>
          </div>
          <dl className="item-fields item-fields-wide">
            <div><dt>External name</dt><dd>{name}</dd></div>
            <div>
              <dt>Drop-in Script</dt>
              <dd className="item-links">
                <button><Eye size={12} /> Preview</button>
                <button><Code2 size={12} /> Grab Script</button>
              </dd>
            </div>
            <div>
              <dt>Payment Link</dt>
              <dd className="item-links"><button><Link2 size={12} /> Get Payment Link</button></dd>
            </div>
          </dl>
        </section>

        <section className="item-card entitlements-card">
          <div className="item-card-head">
            <h2>Entitlements</h2>
            <button><Pencil size={12} /> Edit</button>
          </div>
          <div className="entitlements-banner">
            <Info size={14} />
            <p>This card includes draft features while the corresponding API operation lists only active and archived features. Entitlements to draft features will come into effect and will be included in the API result when the feature is activated.</p>
          </div>
          <div className="entitlements-table">
            <div className="entitlements-row entitlements-head">
              <div>Features</div>
              <div>Entitlements</div>
              <div>Entitlement Version</div>
              <div>Status</div>
            </div>
            {[
              ['API Hits updated', '30 APIS', 'Active'],
              ['Muse', '10 MUSES', 'Active'],
              ['quantity test', '10 licenses', 'Draft'],
            ].map(([feature, entitlement, status]) => (
              <div className="entitlements-row" key={feature}>
                <div className="feature-cell">
                  <button className="feature-link">{feature}</button>
                  <Gauge size={14} className="meter-icon" aria-hidden />
                </div>
                <div>{entitlement}</div>
                <button className="feature-link">View</button>
                <div><span className={`status-pill ${status.toLowerCase()}`}>{status}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="item-card weightage-card">
          <div className="item-card-head">
            <h2>Revenue weightage of features</h2>
            <button onClick={openWeightage}><Pencil size={12} /> Edit</button>
          </div>
          <div className="entitlements-table">
            <div className="weightage-row entitlements-head">
              <div>Features/Credit</div>
              <div>Type</div>
              <div>Weight</div>
              <div>Amount</div>
            </div>
            {weightageItems.map(item => (
              <div className="weightage-row" key={item.name}>
                <div className="feature-cell">
                  <button className="feature-link">{item.name}</button>
                  <Gauge size={14} className="meter-icon" aria-hidden />
                </div>
                <div>{item.type}</div>
                <div>{Number(weights[item.name] || 0).toFixed(2)}%</div>
                <div>{formatMoney(amountFor(weights[item.name] || 0))}</div>
              </div>
            ))}
            <div className="weightage-row weightage-total">
              <div>Total</div>
              <div />
              <div>{weightageItems.reduce((sum, item) => sum + Number(weights[item.name] || 0), 0).toFixed(2)}%</div>
              <div>{formatMoney(weightageItems.reduce((sum, item) => sum + amountFor(weights[item.name] || 0), 0))}</div>
            </div>
          </div>
        </section>

        <section className="item-card events-card">
          <h2>Events</h2>
          <div className="events-head"><span>ID</span><span>Type</span><span>Occured on</span><span>Status</span></div>
          <p>Showing 1 - 0 of 0</p>
        </section>

        <section className="comments-block">
          <div className="item-card-head">
            <h2>Comments</h2>
            <button className="attach"><Paperclip size={11} /> Add Attachment</button>
          </div>
          <div className="comment-box">
            <input placeholder="Add your comment here..." />
            <button>COMMENT</button>
          </div>
        </section>

        <section className="activity-block">
          <h2>Activity Log</h2>
          <p>No logs present</p>
        </section>
        <footer className="item-footer"><a href="#">Privacy</a><a href="#">Terms</a></footer>
      </div>
      <button className="assistant-mid" aria-label="Assistant"><Sparkles size={16} /></button>
      {weightageOpen && (
        <div className="drawer-root">
          <button className="drawer-overlay" aria-label="Close weightage editor" onClick={() => setWeightageOpen(false)} />
          <aside className="weightage-drawer" role="dialog" aria-labelledby="weightage-drawer-title">
            <header className="drawer-header">
              <h2 id="weightage-drawer-title">Edit revenue weightage</h2>
              <button className="drawer-close" aria-label="Close" onClick={() => setWeightageOpen(false)}><X size={16} /></button>
            </header>
            <div className="drawer-modes" role="radiogroup" aria-label="Weightage method" aria-describedby="weightage-mode-help">
              <p id="weightage-mode-help" className="drawer-mode-label">While credits are issued for this item, the amount is calculated based on the weightage defined here.</p>
              <label>
                <input type="radio" name="weight-mode" checked={draftMode === 'equal'} onChange={() => applyDraftMode('equal')} />
                Equal weightage
              </label>
              <label>
                <input type="radio" name="weight-mode" checked={draftMode === 'single'} onChange={() => applyDraftMode('single', draftFeature)} />
                Choose single feature
              </label>
            </div>
            <div className="drawer-table">
              <div className="drawer-row drawer-head">
                <div>Feature/credit</div>
                <div>Weight</div>
                <div>Amount</div>
              </div>
              {catalogFeatures.map(feature => {
                const locked = !feature.metered
                const weight = Number(draftWeights[feature.name] || 0)
                return (
                  <div className={`drawer-row ${locked ? 'drawer-row-locked' : ''}`} key={feature.name}>
                    <div className="feature-cell">
                      {draftMode === 'single' && (feature.metered ? (
                        <input type="radio" name="single-feature" aria-label={feature.name} checked={draftFeature === feature.name} onChange={() => applyDraftMode('single', feature.name)} />
                      ) : (
                        <span className="radio-spacer" aria-hidden />
                      ))}
                      <span>{feature.name}</span>
                      {feature.metered && <Gauge size={14} className="meter-icon" aria-hidden />}
                    </div>
                    <div className="weight-value">
                      {weight.toFixed(2)}%
                      {locked && <span className="weight-tip">Weightage can be provided only to usage-based features</span>}
                    </div>
                    <div>{formatMoney(amountFor(weight))}</div>
                  </div>
                )
              })}
              <div className="drawer-row drawer-total">
                <div>Total</div>
                <div>{Number(draftTotal).toFixed(2)}%</div>
                <div>{formatMoney(amountFor(Number(draftTotal)))}</div>
              </div>
            </div>
            <footer className="drawer-actions">
              <button className="drawer-cancel" onClick={() => setWeightageOpen(false)}>Cancel</button>
              <button className="drawer-apply" onClick={saveWeightage}>Apply</button>
            </footer>
          </aside>
        </div>
      )}
    </div>
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
          <AreaChart data={data} margin={{ top: 10, right: 6, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${metric.data}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#84c8f5" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#84c8f5" stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#edf1f4" />
            <XAxis dataKey="name" interval={5} axisLine={false} tickLine={false} tick={{ fill: '#9aa5ad', fontSize: 14 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a4aeb5', fontSize: 14 }} width={44} />
            <Tooltip contentStyle={{ border: '1px solid #dfe6ea', borderRadius: 6, fontSize: 14 }} />
            <Area type="linear" dataKey="value" stroke="#5eb4ec" strokeWidth={1.2} fill={`url(#fill-${metric.data})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="legend"><i />{metric.legend}</div>
    </article>
  )
}

function App() {
  const navigate = useNavigate()
  const [bannerVisible, setBannerVisible] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [range, setRange] = useState('Daily')
  const [pageView, setPageView] = useState('dashboard')
  const [selectedPlan, setSelectedPlan] = useState(['10 day plan', '10-day-plan'])
  const catalogView = pageView === 'plans' || pageView === 'planDetails' || pageView === 'itemPrice'
  const goTo = view => {
    if (view === 'subscriptions') {
      navigate('/subscriptions')
      setSidebarOpen(false)
      return
    }
    setPageView(view)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} pageView={pageView} onNavigate={goTo} />
      <div className={`page ${catalogView ? 'showing-plans' : ''}`}>
        <div className="preview-bar">{catalogView ? 'Test site — Safe to simulate and experiment ⓘ' : 'TEST SITE — Switch to live site when you’re ready'}</div>
        {pageView === 'plans' ? <PlansPage onSelectPlan={plan => { setSelectedPlan(plan); setPageView('planDetails') }} /> : pageView === 'planDetails' ? <PlanDetails plan={selectedPlan} onBack={() => setPageView('plans')} onOpenPrice={() => setPageView('itemPrice')} /> : pageView === 'itemPrice' ? <ItemPricePage plan={selectedPlan} onBack={() => setPageView('planDetails')} onAllPlans={() => setPageView('plans')} /> : <>
        <header>
          <button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="header-spacer" />
          <button className="product-button">Take Me to Product Page!</button>
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
        </>}
        <button className="assistant"><MessageSquare size={18} /></button>
      </div>
      {sidebarOpen && <button aria-label="Close navigation" className="overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

export default App
