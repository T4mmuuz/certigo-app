const fs=require('fs');
let b=fs.readFileSync('client/src/pages/Bookings.tsx','utf8');

const trackingCode=`
  // Provider location tracking — send every 5 min when has active booking
  useEffect(() => {
    if (!isProvider) return;
    const activeBooking = bookings?.find(b => b.status === 'accepted');
    if (!activeBooking) return;
    const sendLocation = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        fetch('/api/users/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          credentials: 'include',
        }).catch(() => {});
      });
    };
    sendLocation();
    const interval = setInterval(sendLocation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isProvider, bookings]);

  // Customer — poll provider location every 30s for active bookings
  const [providerLocations, setProviderLocations] = useState<Record<number, {lat:number;lng:number}>>({});
  useEffect(() => {
    if (isProvider) return;
    const activeBookings = bookings?.filter(b => b.status === 'accepted') || [];
    if (activeBookings.length === 0) return;
    const poll = async () => {
      for (const booking of activeBookings) {
        try {
          const res = await fetch('/api/bookings/' + booking.id + '/provider-location', { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.lat && data.lng) setProviderLocations(prev => ({ ...prev, [booking.id]: data }));
          }
        } catch {}
      }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [isProvider, bookings]);
`;

const marker = "  const getStatusColor = (status: string) => {";
b = b.replace(marker, trackingCode + "\n  " + marker.trim());
fs.writeFileSync('client/src/pages/Bookings.tsx', b);
console.log(b.includes('sendLocation') ? 'OK' : 'FALTA');
