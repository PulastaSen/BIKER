import { HomePage as MobileDashboard } from './HomePage';
import { LandingPage } from './LandingPage';
import { useMediaQuery } from '../hooks/useMediaQuery';

export function ResponsiveHome() {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <>
      {isDesktop ? <LandingPage /> : <MobileDashboard />}
    </>
  );
}
