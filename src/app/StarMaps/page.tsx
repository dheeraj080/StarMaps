import { MapView } from "@/components/MapView";
import { TLEDataProvider } from "@/context/TLEDataProvider";

export default function StarMapsPage() {
  return (
    <TLEDataProvider>
      <MapView />
    </TLEDataProvider>
  );
}
