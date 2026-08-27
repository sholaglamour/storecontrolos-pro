import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StoreDashboardView from "./components/StoreDashboardView";
import AllStoresOverview from "./components/AllStoresOverview";
import AddStoreModal from "./components/AddStoreModal";
import { useStores } from "./hooks/useStores";

export default function App() {
  const { stores, loading, refresh } = useStores();
  const [selectedId, setSelectedId] = useState<string | null>(null); // null = All Stores
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        stores={stores}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddStore={() => setShowAddModal(true)}
        loading={loading}
      />

      <main className="flex-1 px-8 py-7 max-w-[1400px]">
        {selectedId === null ? (
          <AllStoresOverview onSelectStore={setSelectedId} />
        ) : (
          <StoreDashboardView key={selectedId} storeId={selectedId} />
        )}
      </main>

      {showAddModal && (
        <AddStoreModal
          onClose={() => setShowAddModal(false)}
          onCreated={refresh}
        />
      )}
    </div>
  );
}
