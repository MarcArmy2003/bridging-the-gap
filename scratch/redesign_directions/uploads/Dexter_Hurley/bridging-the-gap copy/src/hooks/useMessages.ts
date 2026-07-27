import { useEffect, useState } from "react";
import { fakeApi } from "../data/fakeApi";

export function useMessages() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const cases = await fakeApi.getCases();
      const all: any[] = [];
      for (const c of cases) {
        const msgs = await fakeApi.getCaseMessages(c.id);
        for (const m of msgs) {
          // map shape
          all.push({ ...m, caseId: c.id });
        }
      }
      if (!mounted) return;
      // sort by createdAt desc
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(all);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { messages };
}

export function useMessagesByCase(caseId: string, recipientRole?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const msgs = await fakeApi.getCaseMessages(caseId);
      if (!mounted) return;
      const filtered = (msgs || []).filter((m: any) => {
        if (!recipientRole) return true;
        const role = recipientRole === "guardian" ? "parent" : recipientRole;
        return m.senderRole === role || m.recipientRole === role;
      });
      setMessages(filtered);
    })();
    return () => {
      mounted = false;
    };
  }, [caseId, recipientRole]);
  return { messages };
}
