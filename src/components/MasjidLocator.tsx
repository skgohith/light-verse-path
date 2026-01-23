import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, Navigation, Clock, Star, Phone, ExternalLink, 
  RefreshCw, Utensils, Building2, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Place {
  id: string;
  name: string;
  address: string;
  distance?: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  type: 'mosque' | 'restaurant';
}

interface Location {
  lat: number;
  lng: number;
}

export function MasjidLocator() {
  const [location, setLocation] = useState<Location | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mosques' | 'halal'>('mosques');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const getLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(loc);
        await fetchNearbyPlaces(loc, activeTab);
      },
      (err) => {
        console.error('Location error:', err);
        setError('Unable to get your location. Please enable location services.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [activeTab]);

  const fetchNearbyPlaces = async (loc: Location, type: 'mosques' | 'halal') => {
    try {
      setLoading(true);
      
      // Using Overpass API (OpenStreetMap) for nearby places
      const query = type === 'mosques' 
        ? `[out:json][timeout:25];
           (
             node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${loc.lat},${loc.lng});
             way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${loc.lat},${loc.lng});
           );
           out body center;`
        : `[out:json][timeout:25];
           (
             node["cuisine"~"halal|muslim"](around:5000,${loc.lat},${loc.lng});
             node["diet:halal"="yes"](around:5000,${loc.lat},${loc.lng});
             node["amenity"="restaurant"]["cuisine"~"arabic|turkish|pakistani|indian|lebanese|middle_eastern"](around:5000,${loc.lat},${loc.lng});
             way["cuisine"~"halal|muslim"](around:5000,${loc.lat},${loc.lng});
           );
           out body center;`;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch places');

      const data = await response.json();
      
      const fetchedPlaces: Place[] = data.elements
        .filter((el: any) => el.tags?.name)
        .map((el: any) => {
          const placeLat = el.lat || el.center?.lat;
          const placeLng = el.lon || el.center?.lon;
          const distance = calculateDistance(loc.lat, loc.lng, placeLat, placeLng);
          
          return {
            id: el.id.toString(),
            name: el.tags.name,
            address: el.tags['addr:street'] 
              ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}, ${el.tags['addr:city'] || ''}`.trim()
              : el.tags['addr:full'] || 'Address not available',
            distance: `${distance.toFixed(1)} km`,
            rating: el.tags.stars ? parseFloat(el.tags.stars) : undefined,
            phone: el.tags.phone || el.tags['contact:phone'],
            website: el.tags.website || el.tags['contact:website'],
            lat: placeLat,
            lng: placeLng,
            type: type === 'mosques' ? 'mosque' : 'restaurant',
            isOpen: undefined, // OSM doesn't provide real-time open status
          };
        })
        .sort((a: Place, b: Place) => parseFloat(a.distance || '0') - parseFloat(b.distance || '0'))
        .slice(0, 20);

      setPlaces(fetchedPlaces);
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Failed to fetch nearby places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openInMaps = (place: Place) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces(location, activeTab);
    }
  }, [activeTab, location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'mosques' | 'halal');
    setSelectedPlace(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Islamic Locator
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={getLocation} 
            disabled={loading}
            className="h-8 w-8"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mosques" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mosques</span>
            </TabsTrigger>
            <TabsTrigger value="halal" className="gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Halal Food</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Map Placeholder - OpenStreetMap Embed */}
      {location && (
        <div className="h-48 md:h-64 bg-muted relative">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.05},${location.lat - 0.03},${location.lng + 0.05},${location.lat + 0.03}&layer=mapnik&marker=${location.lat},${location.lng}`}
            className="w-full h-full border-0"
            title="Map"
            loading="lazy"
          />
          <div className="absolute bottom-2 right-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lng}#map=15/${location.lat}/${location.lng}`, '_blank')}
              className="gap-1 text-xs"
            >
              <ExternalLink className="w-3 h-3" />
              Full Map
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Finding nearby {activeTab === 'mosques' ? 'mosques' : 'halal restaurants'}...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={getLocation}>
              Try Again
            </Button>
          </div>
        ) : places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No {activeTab === 'mosques' ? 'mosques' : 'halal restaurants'} found nearby
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] md:h-[400px]">
            <div className="space-y-3">
              {places.map((place) => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(selectedPlace?.id === place.id ? null : place)}
                  className={cn(
                    "p-3 rounded-lg border transition-all cursor-pointer",
                    selectedPlace?.id === place.id 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-muted/50 border-border hover:bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {place.type === 'mosque' ? (
                          <Building2 className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <Utensils className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <h4 className="font-medium text-foreground truncate">{place.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{place.address}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        {place.distance && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            {place.distance}
                          </span>
                        )}
                        {place.rating && (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            {place.rating}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(place);
                      }}
                      className="shrink-0 gap-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span className="hidden sm:inline">Navigate</span>
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedPlace?.id === place.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      {place.phone && (
                        <a 
                          href={`tel:${place.phone}`}
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-3 h-3" />
                          {place.phone}
                        </a>
                      )}
                      {place.website && (
                        <a 
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Website
                        </a>
                      )}
                      <Button 
                        size="sm" 
                        className="w-full gap-2 mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps(place);
                        }}
                      >
                        <Navigation className="w-4 h-4" />
                        Get Directions
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
