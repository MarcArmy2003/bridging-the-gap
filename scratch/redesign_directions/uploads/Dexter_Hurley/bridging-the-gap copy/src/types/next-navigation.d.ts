declare module 'next/navigation' {
  export function useRouter(): { push: (path: string) => void; back: () => void };
}
