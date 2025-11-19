import { useEffect, useState } from 'react';

export default function useCurrentUser() {
  const [user, setUser] = useState<{id:number;email:string}|null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    let mounted = true;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if(mounted) setUser(data) })
      .catch(()=> { if(mounted) setUser(null) })
      .finally(()=> mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);
  return { user, loading };
}
