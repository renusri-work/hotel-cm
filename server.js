/**
 * SyncStay Static Mock Backend (Node.js / Express)
 * Provides static mock endpoints for channel manager synchronization,
 * bookings, and GST reporting.
 */

import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Static performance mock
const staticPerformance = {
  period: '29 Sep – 28 Oct · by check-in date',
  comparison: 'vs 30 Aug – 28 Sep',
  netRevenue: 32087.48,
  stay: 32087.48,
  upsell: 0.00,
  expenses: 0.00,
  netOperatingIncome: 32087.48,
  marginPct: 100.0,
  occupancy: {
    pct: 25.0,
    bookedNights: 7,
    availableNights: 28,
    diffPts: 25.0,
  },
  netADR: 4584,
  netRevPAR: 1146,
  whereBookingsComeFrom: {
    totalRevenue: 32087,
    channels: [
      { source: 'Goibibo', bookings: 4, nights: 6, share: 75, netADR: 4015, revenue: 24087 },
      { source: 'Homeyhuts Direct', bookings: 1, nights: 1, share: 25, netADR: 8000, revenue: 8000, commissionSaved: 1200 },
    ],
  },
  today: {
    date: 'Thursday, 29 October',
    checkIns: 0,
    checkOuts: 0,
    ongoingStays: 0,
    arrivingNext2Days: 0,
  },
};

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SyncStay Channel Manager Static API', timestamp: new Date().toISOString() });
});

// Performance stats endpoint
app.get('/api/performance', (req, res) => {
  res.json(staticPerformance);
});

// Mock 2-way sync endpoint
app.post('/api/sync/dispatch', (req, res) => {
  const { propertyId, action, details } = req.body || {};
  res.json({
    success: true,
    action: action || 'outbound_block',
    status: 'synced_to_all_otas',
    channels: ['Goibibo', 'Airbnb', 'Booking.com', 'Homeyhuts Direct'],
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`SyncStay static mock backend listening on port ${port}`);
  });
}

export default app;
