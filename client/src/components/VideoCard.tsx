import { PlayCircle } from 'lucide-react';

interface VideoCardProps {
  src?: string;
  poster?: string;
  title?: string;
  description?: string;
}

export function VideoCard({
  src,
  poster = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
  title = 'See MotoAssist in Action',
  description = 'From a roadside problem to the right support.'
}: VideoCardProps) {
  return (
    <div className="video-card-container">
      <div className="video-card-header">
        <h2>{title}</h2>
        <p className="subtitle">{description}</p>
      </div>
      <div className="video-player-wrapper">
        {src ? (
          <video 
            src={src}
            poster={poster}
            controls
            className="video-player"
            preload="metadata"
          />
        ) : (
          <div className="video-placeholder" style={{ backgroundImage: `url(${poster})` }}>
            <div className="video-overlay"></div>
            <button className="play-button" aria-label="Play Demo Video">
              <PlayCircle size={64} />
            </button>
            <div className="video-coming-soon">Demo video coming soon</div>
          </div>
        )}
      </div>
    </div>
  );
}
