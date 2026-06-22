import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Map, MapPin, Search, ChevronRight, Loader, AlertCircle, Compass } from 'lucide-react';
import api from '@/lib/api';
import { type DivisionDTO, type LocationDTO, type TourSpotDTO } from '@/hooks/useLocations';

const DestinationsPage: React.FC = () => {
  const [divisions, setDivisions] = useState<DivisionDTO[]>([]);
  const [locations, setLocations] = useState<LocationDTO[]>([]);
  const [tourSpots, setTourSpots] = useState<TourSpotDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [activeDivisionId, setActiveDivisionId] = useState<number | null>(null);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [divRes, locRes, spotRes] = await Promise.all([
          api.get<DivisionDTO[]>('/Divisions'),
          api.get<LocationDTO[]>('/Locations'),
          api.get<TourSpotDTO[]>('/TourSpots')
        ]);
        setDivisions(divRes.data);
        setLocations(locRes.data);
        setTourSpots(spotRes.data);
        
        if (divRes.data.length > 0) setActiveDivisionId(divRes.data[0].divisionId);
      } catch (err) {
        setError('Failed to load destination data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter locations based on active division + search
  const filteredLocations = useMemo(() => {
    let locs = locations;
    if (activeDivisionId) {
      locs = locs.filter(l => l.divisionId === activeDivisionId);
    }
    if (search.trim() !== '') {
      const s = search.toLowerCase();
      locs = locations.filter(l => l.locationName?.toLowerCase().includes(s));
    }
    return locs;
  }, [locations, activeDivisionId, search]);

  // Handle division click
  const handleDivisionClick = (divId: number) => {
    setSearch('');
    setActiveDivisionId(divId);
    setActiveLocationId(null);
  };

  // Filter spots based on active location
  const spotsForLocation = useMemo(() => {
    if (!activeLocationId) return [];
    return tourSpots.filter(s => s.locationId === activeLocationId);
  }, [tourSpots, activeLocationId]);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--brand-light)' }}>
      {/* ── Header ── */}
      <div className="pt-24 pb-16" style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-2">Explore Bangladesh</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Destinations</h1>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Discover beautiful locations, hidden gems, and iconic tour spots across every division.
          </p>
          
          <div className="mt-8 max-w-lg mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search for a location or city..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value) setActiveDivisionId(null);
                else if (divisions.length > 0) setActiveDivisionId(divisions[0].divisionId);
              }}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl text-slate-800 font-medium focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 min-h-[500px]">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <Loader size={36} className="animate-spin" style={{ color: 'var(--brand-navy)' }} />
              <p className="text-slate-400 font-medium text-sm">Mapping out destinations...</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium justify-center">
              <AlertCircle size={16} /> {error}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* ── Left Sidebar (Divisions) ── */}
              {!search && (
                <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6 overflow-x-auto lg:overflow-x-visible flex lg:flex-col gap-2 hide-scrollbar">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 hidden lg:block px-2">Divisions</h3>
                  {divisions.map(div => (
                    <button
                      key={div.divisionId}
                      onClick={() => handleDivisionClick(div.divisionId)}
                      className={`flex-none lg:flex w-auto lg:w-full items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                        ${activeDivisionId === div.divisionId ? 'bg-slate-50 shadow-sm' : 'text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'}`}
                      style={activeDivisionId === div.divisionId ? { color: 'var(--brand-navy)', borderLeft: '4px solid var(--brand-yellow)' } : { borderLeft: '4px solid transparent' }}
                    >
                      {div.divisionName}
                      {activeDivisionId === div.divisionId && <ChevronRight size={16} className="hidden lg:block text-slate-400" />}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Right Content (Locations & Spots) ── */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--brand-navy)' }}>
                    <Map size={20} className="text-yellow-500" />
                    {search ? `Search Results for "${search}"` : divisions.find(d => d.divisionId === activeDivisionId)?.divisionName + ' Locations'}
                  </h2>
                  <span className="text-sm font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {filteredLocations.length} Locations
                  </span>
                </div>

                {filteredLocations.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <MapPin size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No locations found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredLocations.map(loc => {
                      const isActive = activeLocationId === loc.locationId;
                      const spotsCount = tourSpots.filter(s => s.locationId === loc.locationId).length;
                      
                      return (
                        <div key={loc.locationId} className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white
                          ${isActive ? 'border-yellow-400 shadow-md ring-4 ring-yellow-400/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                          
                          {/* Location Card Header */}
                          <div 
                            className={`p-5 cursor-pointer flex items-center justify-between ${isActive ? 'bg-slate-50/50' : ''}`}
                            onClick={() => setActiveLocationId(isActive ? null : loc.locationId)}
                          >
                            <div>
                              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--brand-navy)' }}>{loc.locationName}</h3>
                              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                                <Compass size={14} className="text-slate-300" />
                                {spotsCount} Tour Spots available
                              </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isActive ? 'rotate-90 bg-yellow-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <ChevronRight size={18} />
                            </div>
                          </div>

                          {/* Tour Spots Dropdown (Accordion) */}
                          <div className={`grid transition-all duration-300 ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden bg-slate-50/50 border-t border-slate-100">
                              <div className="p-5 flex flex-col gap-2">
                                {spotsCount === 0 ? (
                                  <p className="text-sm text-slate-400 italic">No specific spots listed yet.</p>
                                ) : (
                                  tourSpots.filter(s => s.locationId === loc.locationId).map(spot => (
                                    <div key={spot.spotId} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                      <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                        <MapPin size={12} />
                                      </div>
                                      <span className="text-sm font-semibold text-slate-700">{spot.spotName}</span>
                                    </div>
                                  ))
                                )}
                                <Link to={`/tours?location=${loc.locationName}`} className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-center transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--brand-navy)', color: 'white' }}>
                                  View Tours Here
                                </Link>
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
