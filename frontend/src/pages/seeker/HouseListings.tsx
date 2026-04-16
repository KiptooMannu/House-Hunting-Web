import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { useGetHousesQuery, useGetTownsQuery } from '../../store/apiSlice';
import { formatCurrency, getHouseImage } from '../../utils/helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HouseListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: townsData } = useGetTownsQuery(undefined);
  
  // Local filter state purely for UI inputs
  const [filters, setFilters] = useState({
    county: searchParams.get('location') || searchParams.get('county') || '',
    minRent: parseInt(searchParams.get('minPrice') || searchParams.get('minRent') || '5000'),
    maxRent: parseInt(searchParams.get('maxPrice') || searchParams.get('maxRent') || '1000000'),
    bedrooms: searchParams.get('bedrooms') || '',
    search: searchParams.get('search') || '',
    houseType: searchParams.get('houseType') || ''
  });

  // Sync local filter UI state when URL changes (e.g. on direct navigation)
  useEffect(() => {
    setFilters({
      county: searchParams.get('location') || searchParams.get('county') || '',
      minRent: parseInt(searchParams.get('minPrice') || searchParams.get('minRent') || '5000'),
      maxRent: parseInt(searchParams.get('maxPrice') || searchParams.get('maxRent') || '1000000'),
      bedrooms: searchParams.get('bedrooms') || '',
      search: searchParams.get('search') || '',
      houseType: searchParams.get('houseType') || ''
    });
    setPage(parseInt(searchParams.get('page') || '1'));
  }, [searchParams]);

  // The actual query uses values derived FROM THE URL to ensure source-of-truth consistency
  const queryParams = {
    page,
    limit: 12,
    county: searchParams.get('location') || searchParams.get('county') || '',
    minRent: searchParams.get('minPrice') || searchParams.get('minRent') || '5000',
    maxRent: searchParams.get('maxPrice') || searchParams.get('maxRent') || '1000000',
    bedrooms: searchParams.get('bedrooms') || '',
    search: searchParams.get('search') || '',
    houseType: searchParams.get('houseType') || '',
    // If landlord, only show their own listings
    ...(user?.role === 'landlord' ? { landlordId: user.userId } : {})
  };

  const { data, isLoading: loading } = useGetHousesQuery(queryParams);

  const houses = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / 12);

  function handleDeployFilter() {
    const params: any = {};
    if (filters.county) params.location = filters.county;
    if (filters.minRent > 5000) params.minPrice = filters.minRent.toString();
    if (filters.maxRent < 1000000) params.maxPrice = filters.maxRent.toString();
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;
    if (filters.search) params.search = filters.search;
    if (filters.houseType) params.houseType = filters.houseType;
    params.page = '1'; // Reset to page 1 on new filter
    
    setSearchParams(params);
  }

  function handleFilterReset() {
    setFilters({
      county: '',
      minRent: 5000,
      maxRent: 1000000,
      bedrooms: '',
      search: '',
      houseType: ''
    });
    setPage(1);
  }

  return (
    <main className="pt-32 pb-24 px-8 lg:px-12 max-w-[1700px] mx-auto min-h-screen font-body text-left">
      <div className="flex flex-col lg:flex-row gap-16 text-left">
        {/* Filter Sidebar - High-Fidelity Savanna Style */}
        <aside className="w-full lg:w-[350px] flex-shrink-0 space-y-10 text-left">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-primary/5 border border-slate-100 text-left sticky top-32">
            <div className="flex justify-between items-center mb-10 text-left">
              <h2 className="text-2xl font-black text-primary font-headline italic tracking-tighter">Refine Search</h2>
              <button onClick={handleFilterReset} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">Reset</button>
            </div>
            
            {/* Master Search */}
            <div className="mb-10 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4 block">Institutional Search</label>
              <div className="relative group text-left">
                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary transition-colors">search</span>
                <input 
                  type="text"
                  placeholder="Titles, neighborhoods..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleDeployFilter()}
                />
              </div>
            </div>

            {/* Area Discovery */}
            <div className="mb-10 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4 block">Neighborhood Node</label>
              <Select 
                value={filters.county} 
                onValueChange={(val) => {
                  const newCounty = val === 'all' ? '' : val;
                  setFilters({ ...filters, county: newCounty });
                  // Instant search for selection
                  const newParams = new URLSearchParams(searchParams);
                  if (newCounty) newParams.set('location', newCounty);
                  else newParams.delete('location');
                  newParams.set('page', '1');
                  setSearchParams(newParams);
                }}
              >
                <SelectTrigger className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-7 px-6 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-primary/5 transition-all outline-none">
                   <SelectValue placeholder="Select Sector..." />
                </SelectTrigger>
                <SelectContent className="rounded-[2.5rem] border-slate-100 shadow-3xl bg-white/95 backdrop-blur-3xl p-4">
                  <SelectItem value="all" className="text-xs font-bold py-4 focus:bg-slate-50 rounded-xl">All Sectors</SelectItem>
                  {townsData?.map((town: string) => (
                    <SelectItem key={town} value={town} className="text-xs font-bold py-4 capitalize focus:bg-slate-50 rounded-xl">
                      {town}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Class */}
            <div className="mb-10 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4 block">Asset Class</label>
              <div className="flex flex-wrap gap-2 text-left">
                {['apartment', 'mansion', 'penthouse', 'commercial'].map(type => (
                  <button 
                    key={type}
                    onClick={() => {
                      const newValue = filters.houseType === type ? '' : type;
                      setFilters({...filters, houseType: newValue});
                      const newParams = new URLSearchParams(searchParams);
                      if (newValue) newParams.set('houseType', newValue);
                      else newParams.delete('houseType');
                      newParams.set('page', '1');
                      setSearchParams(newParams);
                    }}
                    className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                      filters.houseType === type ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Spectrum */}
            <div className="mb-12 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/30 mb-4 block">Capital Allocation (KSh)</label>
              <div className="px-2 text-left">
                <Slider 
                  value={[filters.minRent, filters.maxRent]} 
                  max={1000000} 
                  min={5000} 
                  step={5000} 
                  onValueChange={(val) => setFilters({ ...filters, minRent: val[0], maxRent: val[1] })}
                  onValueCommit={handleDeployFilter}
                  className="py-6"
                />
                <div className="flex justify-between mt-2 text-[10px] font-black tracking-widest text-primary/60 uppercase">
                  <span>{formatCurrency(filters.minRent)}</span>
                  <span className="text-secondary">{formatCurrency(filters.maxRent)}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleDeployFilter} className="w-full bg-primary text-white py-8 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-primary-container transition-all border-none">
              Apply Master Refinement
            </Button>
          </div>
        </aside>

        {/* Results Area */}
        <section className="flex-1 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 text-left">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-secondary mb-4 block">Curated Anthology</span>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-primary tracking-tighter italic leading-none mb-4 text-left">
                 Kenyan Estates.
              </h1>
              <p className="text-on-surface-variant text-sm font-medium italic opacity-60">Displaying {total} institutional-grade residential clusters found within chosen parameters.</p>
            </div>
          </div>

          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-6 opacity-30 text-left">
                <span className="material-symbols-outlined text-7xl animate-spin">autorenew</span>
                <p className="text-xs font-bold uppercase tracking-[0.3em]">Synchronizing Nodes...</p>
             </div>
          ) : houses.length === 0 ? (
            <div className="py-32 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center">
               <span className="material-symbols-outlined text-6xl text-primary/20 mb-6">search_off</span>
               <h3 className="text-xl font-bold text-primary mb-2">No Matching Assets Found</h3>
               <p className="text-on-surface-variant text-sm max-w-sm font-medium italic">Adjust your investment bracket or neighborhood node to discover available clusters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 text-left">
              {houses.map((house: any) => (
                <Link key={house.houseId} to={`/houses/${house.houseId}`} className="group block text-left">
                  <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-3xl transition-all duration-700 border border-slate-100 hover:-translate-y-2 text-left">
                    <div className="h-80 overflow-hidden relative text-left">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                        src={getHouseImage(house.images?.[0])} 
                        alt={house.title}
                      />
                      <div className="absolute top-6 left-6 flex gap-3 text-left">
                        <Badge className="bg-white/90 backdrop-blur-xl text-primary border-none shadow-lg text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                          {house.location?.town || 'Metropolitan'}
                        </Badge>
                        <Badge className="bg-secondary/90 backdrop-blur-xl text-white border-none shadow-lg text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
                           <span className="material-symbols-outlined text-xs font-variation-fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                           Verified Node
                        </Badge>
                      </div>
                      <div className="absolute bottom-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-left">
                         <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                            <span className="material-symbols-outlined">arrow_forward</span>
                         </div>
                      </div>
                    </div>
                    <div className="p-10 text-left">
                      <div className="flex justify-between items-start mb-6 text-left">
                        <div className="text-left">
                          <h3 className="text-2xl font-black text-primary font-headline italic tracking-tighter mb-1">{house.title}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{house.houseType || 'Residential Asset'}</p>
                        </div>
                        <p className="text-primary font-black text-2xl italic tracking-tighter">{formatCurrency(house.monthlyRent)}/mo</p>
                      </div>
                      <div className="flex items-center gap-8 text-slate-400 border-t border-slate-50 pt-8 text-left">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-lg">bed</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{house.bedrooms} Nodes</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-lg">shower</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">{house.bathrooms || 2} Bath</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-lg">square_foot</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Premium Enclosure</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="mt-20 flex justify-center gap-6 text-left">
               <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-10 py-5 bg-white border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-xl hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                Previous Anthology
              </button>
              <button 
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="px-10 py-5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-primary-container disabled:opacity-30 transition-all flex items-center gap-3"
              >
                Discover More
                <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
