"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Cpu,
  Package,
  Layers,
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  QrCode,
  Wrench,
  X,
  Printer,
  Sparkles,
  Bot
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: 'Robotics' | 'Microcontroller' | 'Sensors' | 'Drones' | 'Makerspace' | 'Consumables';
  totalQty: number;
  availableQty: number;
  inUseQty: number;
  location: string;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'MAINTENANCE';
  serialPrefix: string;
}

export default function LabInventoryPage() {
  const { activeSchool, students } = useAuth();

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: 'item-1',
      name: 'InnovatMind Autonomous Rover V2 Chassis Kit',
      category: 'Robotics',
      totalQty: 50,
      availableQty: 28,
      inUseQty: 22,
      location: 'Cabinet A1 - Shelf 2',
      status: 'AVAILABLE',
      serialPrefix: 'RVR-2025',
    },
    {
      id: 'item-2',
      name: 'ESP32-CAM AI Vision Dual-Core Microcontroller',
      category: 'Microcontroller',
      totalQty: 40,
      availableQty: 6,
      inUseQty: 34,
      location: 'Cabinet B3 - Drawer 1',
      status: 'LOW_STOCK',
      serialPrefix: 'ESP-32C',
    },
    {
      id: 'item-3',
      name: 'HC-SR04 Ultrasonic Sonar Distance Sensors',
      category: 'Sensors',
      totalQty: 100,
      availableQty: 64,
      inUseQty: 36,
      location: 'Sensor Tray S-12',
      status: 'AVAILABLE',
      serialPrefix: 'SNR-04',
    },
    {
      id: 'item-4',
      name: 'Autonomous Quadcopter Flight Controller + Brushless ESC',
      category: 'Drones',
      totalQty: 30,
      availableQty: 12,
      inUseQty: 18,
      location: 'Drone Bay Station 2',
      status: 'AVAILABLE',
      serialPrefix: 'DRN-FC',
    },
    {
      id: 'item-5',
      name: 'Creality High-Speed CoreXY 3D Printer',
      category: 'Makerspace',
      totalQty: 4,
      availableQty: 3,
      inUseQty: 1,
      location: 'FabLab Bench 1',
      status: 'MAINTENANCE',
      serialPrefix: '3DP-01',
    },
    {
      id: 'item-6',
      name: '1.75mm PLA+ Filament Spools (Multi-Color Pack)',
      category: 'Consumables',
      totalQty: 20,
      availableQty: 3,
      inUseQty: 17,
      location: 'Material Rack R4',
      status: 'LOW_STOCK',
      serialPrefix: 'FIL-PLA',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Issue Hardware Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedItemForIssue, setSelectedItemForIssue] = useState<InventoryItem | null>(null);
  const [targetStudentName, setTargetStudentName] = useState(students[0]?.firstName + ' ' + students[0]?.lastName || 'Aarav Verma');
  const [issueTagCode, setIssueTagCode] = useState('');

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Robotics' | 'Microcontroller' | 'Sensors' | 'Drones' | 'Makerspace'>('Robotics');
  const [newItemQty, setNewItemQty] = useState(25);
  const [newItemLocation, setNewItemLocation] = useState('Cabinet A2');

  const totalAssets = inventory.reduce((acc, curr) => acc + curr.totalQty, 0);
  const totalInUse = inventory.reduce((acc, curr) => acc + curr.inUseQty, 0);
  const totalAvailable = inventory.reduce((acc, curr) => acc + curr.availableQty, 0);
  const lowStockCount = inventory.filter(i => i.status === 'LOW_STOCK').length;

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenIssueModal = (item: InventoryItem) => {
    setSelectedItemForIssue(item);
    setIssueTagCode(`${item.serialPrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsIssueModalOpen(true);
  };

  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForIssue) return;

    if (selectedItemForIssue.availableQty <= 0) {
      alert('Error: No units currently available for checkout.');
      return;
    }

    setInventory(prev => prev.map(item => {
      if (item.id === selectedItemForIssue.id) {
        const newAvail = item.availableQty - 1;
        const newInUse = item.inUseQty + 1;
        return {
          ...item,
          availableQty: newAvail,
          inUseQty: newInUse,
          status: newAvail <= 5 ? 'LOW_STOCK' : 'AVAILABLE',
        };
      }
      return item;
    }));

    setIsIssueModalOpen(false);
    setToastNotice(`✓ Tag ${issueTagCode} of "${selectedItemForIssue.name}" successfully checked out to ${targetStudentName}!`);
    setTimeout(() => setToastNotice(null), 5000);
  };

  const handleReturnItem = (item: InventoryItem) => {
    if (item.inUseQty <= 0) return;

    setInventory(prev => prev.map(i => {
      if (i.id === item.id) {
        const newAvail = i.availableQty + 1;
        const newInUse = i.inUseQty - 1;
        return {
          ...i,
          availableQty: newAvail,
          inUseQty: newInUse,
          status: newAvail <= 5 ? 'LOW_STOCK' : 'AVAILABLE',
        };
      }
      return i;
    }));

    setToastNotice(`✓ 1 unit of "${item.name}" returned and verified into ${item.location}!`);
    setTimeout(() => setToastNotice(null), 5000);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      totalQty: Number(newItemQty),
      availableQty: Number(newItemQty),
      inUseQty: 0,
      location: newItemLocation,
      status: 'AVAILABLE',
      serialPrefix: newItemCategory.slice(0, 3).toUpperCase(),
    };

    setInventory(prev => [newItem, ...prev]);
    setIsAddModalOpen(false);
    setNewItemName('');
    setToastNotice(`✓ Added new hardware asset "${newItem.name}" (${newItem.totalQty} units) to ${activeSchool.name} STEM Lab!`);
    setTimeout(() => setToastNotice(null), 5000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 mb-1">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>{activeSchool.name} • Robotics Lab & Makerspace Asset Vault</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              STEM Hardware & Kit Inventory Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time checkout logs, RFID sensor tagging, stock replenishment alerts, and lab equipment maintenance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="default"
              className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-100 font-bold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hardware Asset</span>
            </Button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastNotice}</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-emerald-700 font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hardware Assets</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{totalAssets} Units</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Across {inventory.length} Equipment Categories</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-cyan-700">
              <span>Verified Barcode Audit ✓</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Active Lab Use</span>
              <div className="text-3xl font-extrabold text-indigo-700 mt-2 font-mono">{totalInUse} Kits</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {Math.round((totalInUse / (totalAssets || 1)) * 100)}% Utilization Rate
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700">
              <span>Issued to Grades 6–8 Cadets</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available on Shelf</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">{totalAvailable} Kits</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Ready for Immediate Issue</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Calibrated & Tested</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Attention</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-2 font-mono">{lowStockCount} Items</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Below Minimum Threshold (5 Units)</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Auto-Purchase Order Drafted</span>
            </div>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by kit name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'Robotics', 'Microcontroller', 'Sensors', 'Drones', 'Makerspace', 'Consumables'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInventory.map((item) => {
            const availPct = Math.round((item.availableQty / (item.totalQty || 1)) * 100);

            return (
              <Card key={item.id} className="light-glass p-5 rounded-3xl border border-slate-200/80 shadow-xs luxury-card-hover flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={item.status === 'AVAILABLE' ? 'success' : item.status === 'LOW_STOCK' ? 'warning' : 'destructive'}>
                      {item.status}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {item.location}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">{item.name}</h3>
                  <div className="text-xs text-cyan-700 font-semibold mt-0.5">{item.category}</div>

                  {/* Stock Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Stock Availability:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.availableQty} / {item.totalQty} ({availPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.availableQty <= 5 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${availPct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      In Lab Use: {item.inUseQty} Units • Tag Prefix: {item.serialPrefix}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReturnItem(item)}
                    disabled={item.inUseQty <= 0}
                    className="font-bold text-xs h-8 border-slate-200 text-slate-700 hover:text-emerald-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Return</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleOpenIssueModal(item)}
                    disabled={item.availableQty <= 0}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs h-8 shadow-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
                    <span>Issue Kit</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal: Issue Hardware Kit to Student */}
        {isIssueModalOpen && selectedItemForIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Issue Lab Hardware Kit</h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedItemForIssue.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsIssueModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmIssue} className="mt-4 space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Asset:</span>
                    <span className="font-bold text-slate-900">{selectedItemForIssue.name}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-500">Current Stock:</span>
                    <span className="font-mono font-bold text-emerald-700">{selectedItemForIssue.availableQty} Units Available</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign to Student Cadet *</label>
                  <select
                    value={targetStudentName}
                    onChange={(e) => setTargetStudentName(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                        {s.firstName} {s.lastName} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Generated RFID / Barcode Tag</label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-2.5 h-4 w-4 text-cyan-600" />
                    <Input
                      readOnly
                      value={issueTagCode}
                      className="pl-9 bg-slate-50 border-slate-300 font-mono text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                  >
                    Confirm Checkout
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add New Hardware Asset */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Add Lab Equipment</h3>
                    <p className="text-xs text-slate-500 font-medium">Catalog physical STEM kit into institutional vault</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddNewItem} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Equipment Name *</label>
                  <Input
                    required
                    placeholder="e.g. Raspberry Pi 4 AI Vision Sensor Array"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="bg-white border-slate-300 font-semibold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category *</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value as any)}
                      className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Robotics">Robotics</option>
                      <option value="Microcontroller">Microcontroller</option>
                      <option value="Sensors">Sensors</option>
                      <option value="Drones">Drones</option>
                      <option value="Makerspace">Makerspace</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Initial Quantity *</label>
                    <Input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="bg-white border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Location in Lab *</label>
                  <Input
                    required
                    placeholder="e.g. Cabinet A2 - Shelf 1"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                    className="bg-white border-slate-300 font-semibold text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    className="font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs"
                  >
                    Add to Inventory
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
