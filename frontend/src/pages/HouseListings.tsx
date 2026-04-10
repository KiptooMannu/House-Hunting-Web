import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetHousesQuery, useGetTownsQuery } from '../store/apiSlice';
import { formatCurrency } from '../utils/helpers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HouseListings() {
  const [page, setPage] = useState(1);
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [nearMe, setNearMe] = useState(false);
  const [filters, setFilters] = useState({
    county: '', minRent: 1, maxRent: 500000, bedrooms: '', search: '',
  });

  const { data: townsData } = useGetTownsQuery(undefined);
  const { data, isLoading: loading } = useGetHousesQuery({
    page,
    limit: 12,
    ...filters,
    ...(filters.bedrooms ? { bedrooms: parseInt(filters.bedrooms) } : {}),
    ...(nearMe && coords ? { lat: coords.lat, lng: coords.lng } : {})
  });

  const houses = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / 12);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMe(true);
      });
    }
  };

  function handleFilter(e: React.FormEvent) {
    if (e) e.preventDefault();
    setPage(1);
  }


  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen font-body">
      <div className="flex flex-col md:flex-row gap-12 text-left">
        {/* Filter Sidebar */}
        <aside className="w-full md:w-72 flex-shrink-0 space-y-8">
          <div className="bg-surface-container-low p-6 rounded-xl">
            <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 font-headline">
              <span className="material-symbols-outlined">tune</span> Filters
            </h2>
            
            {/* Discovery Intelligence */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-6">Discovery</h3>
              <Button 
                onClick={nearMe ? () => setNearMe(false) : requestLocation}
                variant={nearMe ? "default" : "outline"}
                className={`w-full justify-start gap-4 rounded-2xl py-7 transition-all border-slate-200 group relative overflow-hidden ${nearMe ? 'bg-secondary text-white border-transparent' : 'bg-white hover:border-primary/30'}`}
              >
                <div className={`absolute inset-0 bg-white/10 ${nearMe ? 'animate-pulse' : 'hidden'}`}></div>
                <span className="material-symbols-outlined text-2xl relative z-10">{nearMe ? 'my_location' : 'share_location'}</span>
                <div className="flex flex-col items-start relative z-10">
                  <span className="font-bold tracking-tight text-xs leading-none mb-1">{nearMe ? 'Intelligent Tracking On' : 'Houses Near Me'}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-60 leading-none">Find Proximity</span>
                </div>
              </Button>
            </div>

            {/* Town Discovery */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-6">Explore Town</h3>
              <Select 
                value={filters.county} 
                onValueChange={(val) => setFilters({ ...filters, county: val === 'all' ? '' : val })}
              >
                <SelectTrigger className="w-full bg-surface-container-lowest border border-slate-100 rounded-2xl py-7 px-4 text-xs font-bold focus:ring-4 focus:ring-secondary/5 transition-all outline-none">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary/30 text-lg">travel_explore</span>
                    <SelectValue placeholder="Select a curated area..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl font-manrope">
                  <SelectItem value="all" className="text-xs font-bold py-3">All Regions</SelectItem>
                  {townsData?.map((town: string) => (
                    <SelectItem key={town} value={town} className="text-xs font-bold py-3 capitalize">
                      {town}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Budget Spectrum */}
            <div className="mb-12">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 mb-6 font-manrope">Budget Spectrum</h3>
              <div className="px-1">
                <Slider 
                  value={[filters.maxRent]} 
                  max={500000} 
                  min={20000} 
                  step={5000} 
                  onValueChange={(val) => setFilters({ ...filters, maxRent: val[0] })}
                  className="py-4"
                />
                <div className="flex justify-between mt-2 text-[10px] font-black tracking-widest text-primary/40 uppercase">
                  <span>20K</span>
                  <span className="text-secondary">{formatCurrency(filters.maxRent)}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleFilter} className="w-full bg-primary text-white py-8 rounded-[2rem] font-manrope font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
              Refine Results
            </Button>
          </div>

          {/* Featured Banner */}
          <div className="relative overflow-hidden rounded-xl h-64 bg-primary flex flex-col justify-end p-6 group">
            <img 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqkLISZPT7X4swxOOalrA14OxKwy34s8LDO_ev4HCA-vOwm69gHyamG2WMvvg0mERg5nsD3HX2mj-s0ydwiLyqdX3uNOyfDRZYISmU6HRva2oipWrcDQf_tB_yWvEOz7I1DKiWJE3YI2aNIqyS9CqZtsae6AKm71ZfRlbZKk0cK387gfABhgN3m_6e3wRCeWBRftaQx4lnFF3qc_HJK4dEkjj2K8o5junlVa2wHEC92QCukK2N-6a2ooFqlFRNLyM2NNg4_ecSQHs" 
              alt="Featured"
            />
            <div className="relative z-10 text-left">
              <Badge className="bg-secondary text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-widest font-bold">Curated Choice</Badge>
              <h3 className="text-white font-manrope font-extrabold text-xl mt-2 leading-tight">The Skye Residences</h3>
              <p className="text-primary-fixed text-xs mt-1 text-white/80">Starting from KES 12.5M</p>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <section className="flex-1">
          <div className="flex justify-between items-end mb-8 text-left">
            <div>
              <h1 className="text-4xl font-manrope font-extrabold text-primary -tracking-[0.03em] leading-none mb-2">
                 Properties in Kenya
              </h1>
              <p className="text-on-surface-variant font-body">Showing {total} high-end editorial listings</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><span className="material-symbols-outlined">grid_view</span></Button>
              <Button variant="ghost" size="icon"><span className="material-symbols-outlined">list</span></Button>
            </div>
          </div>

          {loading ? (
             <LoadingSpinner text="Searching for your Horizon..." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {houses.map((house: any) => (
                <Card key={house.houseId} className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 group border-none">
                  <Link to={`/houses/${house.houseId}`}>
                    <div className="h-64 overflow-hidden relative">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        src={house.images && house.images.length > 0 ? house.images[0].imageUrl : "https://lh3.googleusercontent.com/aida-public/AB6AXuAKawWmdL8TUW3Pf9lAa62Av1GgvlHa-OTJDqVAHMWT6LlmMqRFy4-pqiulcS-AwN9VFnyCWLgHbbvz82zBevN16ZXgsAFWsrXCOcwZjEKuliDtFOY5D1VRXT4GY0RZnPRi8WuAPLwLxSMhgZU2ljiP51U9IqmSeqdQ1yuzNsK3uzP3pe2E48FM8LbEY434UPfBPSW4qgxaCXVNGuD0v05C4ULoMMXxadfjCZsQGkUuJzEpXwrJ-q5C-0RB0kgNGChMXTUqR5fdwa4"} 
                        alt={house.title}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur text-primary text-[10px] font-bold px-3 py-1 rounded-full">{house.location?.county || 'NAIROBI'}</Badge>
                        {house.status === 'active' && (
                          <Badge className="bg-secondary/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border-none">
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> VERIFIED
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6 text-left">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-manrope font-extrabold text-primary leading-tight">{house.title}</h3>
                        <div className="text-right">
                          <span className="block text-tertiary font-manrope font-extrabold text-lg">{formatCurrency(house.monthlyRent)}</span>
                          <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">per month</span>
                        </div>
                      </div>
                      <div className="flex gap-6 mb-8 text-on-surface-variant border-y border-surface-container-low py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline">bed</span>
                          <span className="text-sm font-medium">{house.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline">bathtub</span>
                          <span className="text-sm font-medium">{house.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline">square_foot</span>
                          <span className="text-sm font-medium">{house.square_footage || '1,850'} sqft</span>
                        </div>
                      </div>
                      <Button variant="secondary" className="w-full font-manrope font-bold py-6 rounded-full transition-all duration-300">
                        View Details
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pages > 1 && (
            <div className="mt-16 flex justify-center gap-4">
               <Button 
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-full px-8 py-6"
              >
                Previous
              </Button>
              <Button 
                variant="outline"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="rounded-full px-8 py-6"
              >
                Discover More
                <span className="material-symbols-outlined ml-2">expand_more</span>
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
