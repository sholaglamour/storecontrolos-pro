import { useState } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";

interface AddStoreModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddStoreModal({ onClose, onCreated }: AddStoreModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [manager, setManager] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Store name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.addStore({ name, location, manager });
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add store.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="panel w-full max-w-md p-6 animate-fadeUp">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold">Add showroom</h2>
          <button onClick={onClose} className="text-muted hover:text-ivory">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted">Store name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lekki Phase 1 Showroom"
              className="w-full mt-1.5 bg-panel2 border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brass/40"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lagos, NG"
              className="w-full mt-1.5 bg-panel2 border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brass/40"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-muted">Store manager</label>
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="e.g. Ade Johnson"
              className="w-full mt-1.5 bg-panel2 border border-hairline rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brass/40"
            />
          </div>
          {error && <p className="text-[12px] text-signal-rust">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-hairline text-sm text-muted hover:text-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-br from-brass to-brassdim text-ink text-sm font-medium disabled:opacity-60"
            >
              {submitting ? "Adding…" : "Add showroom"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
