// client/src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

/**
 * ProtectedRoute: checks /api/auth/me and either renders children or redirects to /login.
 * - Expects an endpoint at GET /api/auth/me that returns 200 when authenticated.
 * - Uses credentials: 'include' so httpOnly cookies are sent from the browser.
 */
export default function ProtectedRoute({ children }: Props): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (!mounted) return;
        if (res.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (e) {
        setOk(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen grid place-items-center text-white">
        Checking authentication...
      </div>
    );
  }
  if (!ok) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
