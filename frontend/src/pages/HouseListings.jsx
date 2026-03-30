import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';

export default function HouseListings() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    county: '', minRent: '', maxRent: '', bedrooms: '', search: '',
  });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    fetchHouses();
  }, [pagination.page]);

  async function fetchHouses(page = pagination.page) {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.county) params.county = filters.county;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms;
      if (filters.search) params.search = filters.search;

      const res = await api.get('/houses', { params });
      setHouses(res.data.data.houses);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch houses:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilter(e) {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchHouses(1);
  }

  function clearFilters() {
    setFilters({ county: '', minRent: '', maxRent: '', bedrooms: '', search: '' });
    setPagination((p) => ({ ...p, page: 1 }));
    setTimeout(() => fetchHouses(1), 0);
  }

  return (
    <div className="container page">
      <h1>Browse Houses</h1>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Search houses..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="text"
          placeholder="County"
          value={filters.county}
          onChange={(e) => setFilters({ ...filters, county: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Rent"
          value={filters.minRent}
          onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Rent"
          value={filters.maxRent}
          onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
        />
        <select
          value={filters.bedrooms}
          onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
        >
          <option value="">Bedrooms</option>
          <option value="0">Studio</option>
          <option value="1">1 BR</option>
          <option value="2">2 BR</option>
          <option value="3">3 BR</option>
          <option value="4">4+ BR</option>
        </select>
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear</button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="loading-page"><div className="spinner"></div></div>
      ) : houses.length === 0 ? (
        <div className="empty-state">
          <p>No houses found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <h2 className="section-title" style={{ marginTop: 2 }}>Matching Listings</h2>
          <p className="results-count">{pagination.total} house(s) found</p>
          <div className="houses-grid">
            {houses.map((house) => (
              <Link to={`/houses/${house.id}`} key={house.id} className="house-card">
                <div className="house-card-img">
                  {house.images && house.images.length > 0 ? (
                    <img src={house.images[0]} alt={house.title} />
                  ) : (
                    <div className="house-card-placeholder">🏠</div>
                  )}
                  <span className={`badge ${house.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                    {house.status}
                  </span>
                </div>
                <div className="house-card-body">
                  <h3>{house.title}</h3>
                  <p className="house-card-location">📍 {house.location_name || house.county || 'Kenya'}</p>
                  <p className="house-card-price">{formatCurrency(house.rent)}<span>/month</span></p>
                  <div className="house-card-meta">
                    <span>🛏️ {house.bedrooms} BR</span>
                    <span>🚿 {house.bathrooms} BA</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="btn btn-outline btn-sm"
              >Previous</button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="btn btn-outline btn-sm"
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
