import { useEffect, useState } from "react";
import { fakeApi } from "../data/fakeApi";

export function useCases() {
  const [cases, setCases] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const cs = await fakeApi.getCases();
      if (!mounted) return;
      setCases(cs || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return { cases };
}
