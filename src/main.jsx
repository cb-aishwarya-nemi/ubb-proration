import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/tooltip'
import './index.css'
import App from './App.jsx'
import Subscriptions from './pages/Subscriptions'
import SubscriptionDetail from './pages/SubscriptionDetail'
import EditSubscription from './pages/EditSubscription'
import ChargeBreakdown from './pages/ChargeBreakdown'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
          <Route path="/subscriptions/:id/edit" element={<EditSubscription />} />
          <Route path="/subscriptions/:id/charge-breakdown" element={<ChargeBreakdown />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
)
