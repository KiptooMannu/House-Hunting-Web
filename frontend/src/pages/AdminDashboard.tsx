import { useEffect, useState } from 'react';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revenue, setRevenue] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      setLoading(true);
      try {
        const [revenueRes, listingsRes] = await Promise.all([
          api.get('/payments/revenue'),
          api.get('/houses', { params: { page: 1, limit: 100 } })
        ]);
        if (!cancelled) {
          setRevenue(revenueRes.data?.data ?? null);
          setListings(listingsRes.data?.data?.houses ?? []);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load admin data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateListingStatus(listingId: number, approval_status: 'approved' | 'rejected') {
    setUpdating(listingId);
    try {
      await api.put(`/houses/${listingId}`, { approval_status });
      setListings(prev => prev.map(listing => 
        listing.id === listingId ? { ...listing, approval_status } : listing
      ));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update listing status.');
    } finally {
      setUpdating(null);
    }
  }

  if (loading) return <div className="loading-page">Loading...</div>;
  if (error) return <div className="container page">{error}</div>;
  if (!revenue) return <div className="container page">No revenue data.</div>;

  return (
    <div className="admin-dashboard-full">
      <h1>Admin Dashboard</h1>

      <section className="dashboard-stats">
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <strong className="stat-value">{formatCurrency(revenue.summary?.total_revenue ?? 0)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Payments</span>
          <strong className="stat-value">{revenue.summary?.total_payments ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Payment</span>
          <strong className="stat-value">{formatCurrency(revenue.summary?.average_payment ?? 0)}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tracked Months</span>
          <strong className="stat-value">{Array.isArray(revenue.monthly_revenue) ? revenue.monthly_revenue.length : 0}</strong>
        </div>
      </section>

      <div className="dashboard-row" style={{ marginTop: 24 }}>
        <section className="dashboard-section panel dashboard-col">
          <h2>Monthly Revenue</h2>
          {Array.isArray(revenue.monthly_revenue) && revenue.monthly_revenue.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Payments</th>
                </tr>
              </thead>
              <tbody>
                {revenue.monthly_revenue.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td>{row.month}</td>
                    <td>{row.revenue}</td>
                    <td>{row.payment_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No monthly revenue rows found.</div>
          )}
        </section>

        <section className="dashboard-section panel dashboard-col">
          <h2>Payment Status Breakdown</h2>
          {Array.isArray(revenue.status_breakdown) && revenue.status_breakdown.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {revenue.status_breakdown.map((row: any, idx: number) => (
                  <tr key={idx}>
                    <td>{row.payment_status}</td>
                    <td>{row.count}</td>
                    <td>{row.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No status breakdown rows found.</div>
          )}
        </section>
      </div>

      <section className="dashboard-section panel" style={{ marginTop: 24 }}>
        <h2>Listing Approvals</h2>
        {listings.length === 0 ? (
          <div className="empty-state">No listings found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Landlord</th>
                  <th>Location</th>
                  <th>Rent</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.title}</td>
                    <td>{listing.landlord?.name || 'Unknown'}</td>
                    <td>{listing.location_name || listing.county || 'N/A'}</td>
                    <td>{formatCurrency(listing.rent)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span 
                          className={`status-dot status-dot--${listing.approval_status || 'pending'}`}
                          title={`${listing.approval_status ? listing.approval_status.charAt(0).toUpperCase() + listing.approval_status.slice(1) : 'Pending'} approval`}
                        />
                        <span style={{ fontSize: 12 }}>
                          {listing.approval_status ? listing.approval_status.charAt(0).toUpperCase() + listing.approval_status.slice(1) : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td>
                      {listing.approval_status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => updateListingStatus(listing.id, 'approved')}
                            disabled={updating === listing.id}
                          >
                            {updating === listing.id ? 'Updating...' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => updateListingStatus(listing.id, 'rejected')}
                            disabled={updating === listing.id}
                          >
                            {updating === listing.id ? 'Updating...' : 'Reject'}
                          </button>
                        </div>
                      )}
                      {listing.approval_status === 'approved' && (
                        <span style={{ color: 'var(--success)', fontSize: 12 }}>Approved</span>
                      )}
                      {listing.approval_status === 'rejected' && (
                        <span style={{ color: 'var(--danger)', fontSize: 12 }}>Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

