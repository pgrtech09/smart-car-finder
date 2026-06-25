"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Car, Bluetooth, Save, Plus, Trash2, Edit3, User,
  ChevronRight, Shield, Bell, Info, LogOut, Check,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useCar } from "@/hooks/useCar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Car as CarType } from "@/types";

interface CarFormData {
  car_name: string;
  car_model: string;
  bluetooth_device_name: string;
  color: string;
  license_plate: string;
}

const emptyForm: CarFormData = {
  car_name: "",
  car_model: "",
  bluetooth_device_name: "",
  color: "",
  license_plate: "",
};

const CAR_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#4c6ef5", "#8b5cf6", "#ec4899", "#ffffff", "#64748b"];

export default function SetupPage() {
  const { user, signOut } = useAuth();
  const { fetchCars, saveCar, updateCar, deleteCar, loading } = useCar(user?.id);

  const [cars, setCars] = useState<CarType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<CarType | null>(null);
  const [formData, setFormData] = useState<CarFormData>(emptyForm);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"cars" | "profile" | "about">("cars");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchCars();
    setCars(data);
  }, [fetchCars]);

  useEffect(() => { load(); }, [load]);

  const handleOpenForm = (car?: CarType) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        car_name: car.car_name,
        car_model: car.car_model,
        bluetooth_device_name: car.bluetooth_device_name,
        color: car.color ?? "",
        license_plate: car.license_plate ?? "",
      });
    } else {
      setEditingCar(null);
      setFormData(emptyForm);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formData.car_name.trim() || !formData.car_model.trim()) return;
    if (editingCar) {
      await updateCar(editingCar.id, formData);
    } else {
      await saveCar(formData);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this car and all its parking data?")) return;
    setDeletingId(id);
    await deleteCar(id);
    setDeletingId(null);
    load();
  };

  const updateField = (field: keyof CarFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <AppShell>
      <div className="p-4 pb-6 max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="pt-2">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your cars and account</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-surface-800 p-1 gap-1">
          {(["cars", "profile", "about"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all capitalize ${
                activeTab === tab
                  ? "bg-brand-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "cars" ? "🚗 Cars" : tab === "profile" ? "👤 Profile" : "ℹ️ About"}
            </button>
          ))}
        </div>

        {/* ── CARS TAB ── */}
        {activeTab === "cars" && (
          <div className="space-y-3">
            {!showForm && (
              <Button
                variant="primary"
                icon={<Plus size={15} />}
                onClick={() => handleOpenForm()}
                className="w-full justify-center"
              >
                Add New Car
              </Button>
            )}

            {/* Add / Edit Form */}
            {showForm && (
              <Card className="space-y-4 border border-brand-500/20">
                <CardHeader>
                  <CardTitle>{editingCar ? "Edit Car" : "New Car"}</CardTitle>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-slate-500 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </CardHeader>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Car Nickname *</label>
                    <input
                      type="text"
                      placeholder="e.g. My Honda"
                      value={formData.car_name}
                      onChange={(e) => updateField("car_name", e.target.value)}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Car Model *</label>
                    <input
                      type="text"
                      placeholder="e.g. Honda City 2022"
                      value={formData.car_model}
                      onChange={(e) => updateField("car_model", e.target.value)}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">
                      Bluetooth Device Name
                      <span className="text-slate-600 ml-1">(for auto-detect)</span>
                    </label>
                    <div className="relative">
                      <Bluetooth size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Honda City Audio"
                        value={formData.bluetooth_device_name}
                        onChange={(e) => updateField("bluetooth_device_name", e.target.value)}
                        className="w-full bg-surface-800 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/50 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Find this in your phone's Bluetooth settings when paired to your car.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">License Plate</label>
                    <input
                      type="text"
                      placeholder="e.g. MH 01 AB 1234"
                      value={formData.license_plate}
                      onChange={(e) => updateField("license_plate", e.target.value.toUpperCase())}
                      className="w-full bg-surface-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/50 transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Car Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {CAR_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateField("color", color)}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            formData.color === color
                              ? "border-white scale-110"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  icon={saved ? <Check size={15} /> : <Save size={15} />}
                  onClick={handleSave}
                  loading={loading}
                  disabled={!formData.car_name.trim() || !formData.car_model.trim()}
                  className="w-full justify-center"
                >
                  {saved ? "Saved!" : editingCar ? "Update Car" : "Save Car"}
                </Button>
              </Card>
            )}

            {/* Car List */}
            {cars.length === 0 && !showForm ? (
              <div className="glass rounded-2xl p-8 text-center border border-white/5">
                <Car size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No cars added yet.</p>
                <p className="text-slate-600 text-xs mt-1">Add your first car above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cars.map((car) => (
                  <Card key={car.id} className="border border-white/5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: car.color ? `${car.color}20` : undefined }}
                      >
                        <Car
                          size={20}
                          style={{ color: car.color || "#4c6ef5" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{car.car_name}</p>
                        <p className="text-xs text-slate-400 truncate">{car.car_model}</p>
                        {car.license_plate && (
                          <p className="text-xs text-slate-500 font-mono">{car.license_plate}</p>
                        )}
                        {car.bluetooth_device_name && (
                          <p className="text-xs text-brand-400/70 flex items-center gap-1 mt-0.5">
                            <Bluetooth size={10} />
                            {car.bluetooth_device_name}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenForm(car)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(car.id)}
                          disabled={deletingId === car.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            {/* User Info */}
            <Card className="border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow flex-shrink-0">
                  <User size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {user?.user_metadata?.full_name ?? "Driver"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Settings items */}
            {[
              { icon: <Bell size={16} className="text-yellow-400" />, bg: "bg-yellow-500/10", label: "Notifications", sub: "Parking reminders & alerts" },
              { icon: <Shield size={16} className="text-green-400" />, bg: "bg-green-500/10", label: "Privacy", sub: "Manage your data" },
            ].map((item) => (
              <Card key={item.label} className="border border-white/5 cursor-pointer hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.sub}</p>
                  </div>
                  <ChevronRight size={15} className="text-slate-600" />
                </div>
              </Card>
            ))}

            <Button
              variant="danger"
              icon={<LogOut size={15} />}
              onClick={signOut}
              className="w-full justify-center"
            >
              Sign Out
            </Button>
          </div>
        )}

        {/* ── ABOUT TAB ── */}
        {activeTab === "about" && (
          <div className="space-y-3">
            <Card className="border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
                  <Car size={22} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">Smart Car Finder</p>
                  <p className="text-xs text-slate-400">Version 1.0.0</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <p>Smart Car Finder automatically saves your parking location when your phone disconnects from your car's Bluetooth.</p>
                <p>Simply pair your car's Bluetooth device once, and the app will silently track every time you park.</p>
              </div>
            </Card>

            {[
              { title: "How It Works", items: ["Pair your car's Bluetooth in Setup", "Connect your phone to car audio", "App detects Bluetooth disconnect & saves GPS location", "Open Map screen to navigate back to your car"] },
              { title: "Permissions Used", items: ["📍 Location — to save parking coordinates", "📡 Bluetooth — to detect car connect/disconnect", "🌐 Internet — to sync with cloud database"] },
            ].map((section) => (
              <Card key={section.title} className="border border-white/5 space-y-2">
                <p className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Info size={14} className="text-brand-400" />
                  {section.title}
                </p>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-brand-500 mt-0.5">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

            <p className="text-center text-xs text-slate-600 py-2">
              Built with Next.js · Supabase · Tailwind CSS
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
