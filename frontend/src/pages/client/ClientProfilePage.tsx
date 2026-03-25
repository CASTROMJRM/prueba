import ProfilePredictionPanel from "../../components/layout/client/ProfilePredictionPanel/ProfilePredictionPanel";
import { useAuth } from "../../context/AuthContext";

export default function ClientProfilePage() {
  const { user } = useAuth();
  const storageScope = user?.id || user?.email || "cliente";

  return (
    <ProfilePredictionPanel
      storageScope={storageScope}
      displayName={user?.email?.split("@")[0]}
    />
  );
}
