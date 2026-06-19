import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

interface BackupRecord {
  id: string;
  filename: string;
  created_at: string;
  size: number;
  status: string;
}

export default function SettingsModule() {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [backupPath, setBackupPath] = useState("./backups");
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  useEffect(() => {
    loadBackups();
    checkAutoBackup();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const result = await invoke("list_backups", { backup_path: backupPath });
      setBackups(result as BackupRecord[]);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAutoBackup = async () => {
    try {
      const result = await invoke("get_auto_backup_enabled");
      setAutoBackupEnabled(result as boolean);
    } catch (error) {
      console.error("Failed to check auto backup:", error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await invoke("create_backup", { backup_path: backupPath });
      alert("Backup created successfully!");
      loadBackups();
    } catch (error) {
      alert("Failed to create backup: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoBackup = async () => {
    try {
      await invoke("setup_auto_backup", { enabled: !autoBackupEnabled });
      setAutoBackupEnabled(!autoBackupEnabled);
      alert("Auto backup settings updated!");
    } catch (error) {
      alert("Failed to update auto backup: " + error);
    }
  };

  const handleDeleteBackup = async (id: string, filename: string) => {
    if (confirm("Are you sure you want to delete this backup?")) {
      try {
        await invoke("delete_backup", { backup_id: id, filename, backup_path: backupPath });
        alert("Backup deleted successfully!");
        loadBackups();
      } catch (error) {
        alert("Failed to delete backup: " + error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {/* Backup Section */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Backup & Recovery</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Location</label>
            <input
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              Create Backup
            </button>
            <button
              onClick={handleToggleAutoBackup}
              className={`px-4 py-2 rounded-lg transition-colors text-white ${
                autoBackupEnabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"
              }`}
            >
              Auto Backup: {autoBackupEnabled ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        {/* Backups List */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Recent Backups</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {backups.length === 0 ? (
              <p className="text-gray-600 text-sm">No backups found</p>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{backup.filename}</p>
                    <p className="text-gray-600 text-xs">
                      {new Date(backup.created_at).toLocaleString()} • {formatFileSize(backup.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBackup(backup.id, backup.filename)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold ml-3"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Store Settings */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Store Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Store Name" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="text" placeholder="Store Address" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="email" placeholder="Store Email" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="tel" placeholder="Store Phone" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="number" placeholder="Tax Rate (%)" className="px-3 py-2 border border-gray-300 rounded-lg" />
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>English</option>
            <option>Arabic</option>
            <option>French</option>
          </select>
        </div>
        <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">Save Settings</button>
      </div>
    </div>
  );
}
