import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Module-level cache to avoid repeated Supabase fetches across component instances
let _cachedValue: boolean | null = null;
let _listeners: Array<(v: boolean) => void> = [];

export function invalidateAnimationsCache() {
  _cachedValue = null;
}

export function setAnimationsCacheValue(value: boolean) {
  _cachedValue = value;
  _listeners.forEach((fn) => fn(value));
}

export function useAnimationsEnabled(): boolean {
  const [enabled, setEnabled] = useState<boolean>(_cachedValue !== null ? _cachedValue : true);

  useEffect(() => {
    // Subscribe to live updates (e.g. after admin toggles)
    _listeners.push(setEnabled);

    if (_cachedValue !== null) {
      setEnabled(_cachedValue);
    } else {
      supabase
        .from("settings")
        .select("value")
        .eq("key", "background_animations_enabled")
        .maybeSingle()
        .then(({ data }) => {
          const value = data ? (data.value as { enabled: boolean }).enabled !== false : true;
          _cachedValue = value;
          setEnabled(value);
          _listeners.forEach((fn) => fn(value));
        });
    }

    return () => {
      _listeners = _listeners.filter((fn) => fn !== setEnabled);
    };
  }, []);

  return enabled;
}
