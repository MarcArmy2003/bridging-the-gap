import AuthTestPanel from "../components/AuthTestPanel";

export default function AuthTestPage() {
  const btgEnabled = process.env.ENABLE_BTG_AUTH === "true";
  return <AuthTestPanel btgEnabled={btgEnabled} />;
}
