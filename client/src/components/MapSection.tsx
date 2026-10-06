import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create a simple divIcon instead of dealing with leaflet's default image path issues in Vite
const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 12px;" title="${label}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

export type MarkerData = {
  id: string;
  position: [number, number];
  title: string;
  type?: 'rider' | 'helper' | 'mechanic';
};

interface MapSectionProps {
  markers?: MarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactive?: boolean;
}

export function MapSection({
  markers = [],
  center = [26.7271, 88.3953], // Siliguri default
  zoom = 10,
  height = '400px',
  interactive = true,
}: MapSectionProps) {
  const getIcon = (type?: string, title?: string) => {
    let color = '#101827';
    let label = '';
    if (type === 'rider') { color = '#EF4444'; label = 'R'; }
    if (type === 'helper') { color = '#10B981'; label = 'H'; }
    if (type === 'mechanic') { color = '#3B82F6'; label = 'M'; }
    return createIcon(color, title || label);
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '16px', overflow: 'hidden', zIndex: 1, border: '1px solid var(--color-border)' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        zoomControl={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(m => (
          <Marker key={m.id} position={m.position} icon={getIcon(m.type, m.title)}>
            <Popup>{m.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
