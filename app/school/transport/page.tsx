"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MapPin,
  Navigation,
  Users,
  ShieldCheck,
  Phone,
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Search,
  X,
  Sparkles,
  ArrowRight,
  Activity
} from 'lucide-react';

interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  capacity: number;
  boardedCount: number;
  currentSpeed: string;
  currentLocation: string;
  status: 'ON_TIME' | 'ARRIVED' | 'DELAYED';
  delayMins?: number;
  stops: {
    name: string;
    scheduledTime: string;
    status: 'COMPLETED' | 'NEXT' | 'PENDING';
  }[];
  passengers: {
    studentId: string;
    studentName: string;
    grade: string;
    rfidTag: string;
    boardedAt: string;
    parentPhone: string;
    status: 'BOARDED' | 'WAITING';
  }[];
}

export default function SchoolTransportPage() {
  const { activeSchool } = useAuth();

  const [routes, setRoutes] = useState<BusRoute[]>([
    {
      id: 'route-14',
      routeNumber: 'Route 14',
      routeName: 'Sector 62 Main Corridor -> InnovatMind Campus',
      driverName: 'Suresh Yadav',
      driverPhone: '+91 98230 44102',
      vehicleNumber: 'MH-12-AQ-9884',
      capacity: 35,
      boardedCount: 34,
      currentSpeed: '38 km/h',
      currentLocation: 'Sector 62 Main Crossing',
      status: 'ON_TIME',
      stops: [
        { name: 'Kalyani Nagar Circle', scheduledTime: '07:20 AM', status: 'COMPLETED' },
        { name: 'Viman Nagar Gate 2', scheduledTime: '07:35 AM', status: 'COMPLETED' },
        { name: 'Sector 62 Main Crossing', scheduledTime: '07:42 AM', status: 'COMPLETED' },
        { name: 'Wadgaon Sheri Junction', scheduledTime: '07:55 AM', status: 'NEXT' },
        { name: 'InnovatMind Main Campus Gate', scheduledTime: '08:12 AM', status: 'PENDING' },
      ],
      passengers: [
        { studentId: 'stud-1', studentName: 'Aarav Verma', grade: 'Grade 6 (Cyber)', rfidTag: 'TAG-9884', boardedAt: '07:42 AM (Biometric RFID)', parentPhone: '+91 98450 11200', status: 'BOARDED' },
        { studentId: 'stud-2', studentName: 'Diya Nair', grade: 'Grade 6 (Cyber)', rfidTag: 'TAG-9885', boardedAt: '07:35 AM (Biometric RFID)', parentPhone: '+91 98450 11201', status: 'BOARDED' },
        { studentId: 'stud-3', studentName: 'Kabir Mehta', grade: 'Grade 6 (Explorers)', rfidTag: 'TAG-9886', boardedAt: 'Waiting at Wadgaon Sheri', parentPhone: '+91 98450 11202', status: 'WAITING' },
      ],
    },
    {
      id: 'route-08',
      routeNumber: 'Route 08',
      routeName: 'Green Glen Flyover & Baner -> InnovatMind Campus',
      driverName: 'Ramesh Patil',
      driverPhone: '+91 98221 88301',
      vehicleNumber: 'MH-12-AQ-4102',
      capacity: 30,
      boardedCount: 28,
      currentSpeed: '0 km/h (Parked)',
      currentLocation: 'Campus Bus Bay 4',
      status: 'ARRIVED',
      stops: [
        { name: 'Baner High Street', scheduledTime: '07:15 AM', status: 'COMPLETED' },
        { name: 'Green Glen Flyover', scheduledTime: '07:38 AM', status: 'COMPLETED' },
        { name: 'Aundh IT Park', scheduledTime: '07:50 AM', status: 'COMPLETED' },
        { name: 'InnovatMind Main Campus Gate', scheduledTime: '08:10 AM', status: 'COMPLETED' },
      ],
      passengers: [
        { studentId: 'stud-ananya', studentName: 'Ananya Verma', grade: 'Grade 3 (Explorers)', rfidTag: 'TAG-4102', boardedAt: '07:38 AM (Biometric RFID)', parentPhone: '+91 98450 11200', status: 'BOARDED' },
        { studentId: 'stud-4', studentName: 'Rohan Joshi', grade: 'Grade 4', rfidTag: 'TAG-4103', boardedAt: '07:15 AM (Biometric RFID)', parentPhone: '+91 98450 11204', status: 'BOARDED' },
      ],
    },
    {
      id: 'route-03',
      routeNumber: 'Route 03',
      routeName: 'Kothrud Depot & Paud Road -> InnovatMind Campus',
      driverName: 'Mahendra Shinde',
      driverPhone: '+91 98210 99403',
      vehicleNumber: 'MH-12-AQ-1203',
      capacity: 45,
      boardedCount: 42,
      currentSpeed: '24 km/h',
      currentLocation: 'Paud Road Flyover (Traffic Sluggish)',
      status: 'DELAYED',
      delayMins: 8,
      stops: [
        { name: 'Kothrud Stand', scheduledTime: '07:10 AM', status: 'COMPLETED' },
        { name: 'Paud Road Junction', scheduledTime: '07:30 AM', status: 'COMPLETED' },
        { name: 'Deccan Gymkhana', scheduledTime: '07:45 AM', status: 'NEXT' },
        { name: 'InnovatMind Main Campus Gate', scheduledTime: '08:15 AM', status: 'PENDING' },
      ],
      passengers: [
        { studentId: 'stud-5', studentName: 'Advait Rao', grade: 'Grade 7', rfidTag: 'TAG-1203', boardedAt: '07:30 AM (Biometric RFID)', parentPhone: '+91 98450 11205', status: 'BOARDED' },
      ],
    },
  ]);

  const [selectedRouteForManifest, setSelectedRouteForManifest] = useState<BusRoute | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const totalCapacity = routes.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalBoarded = routes.reduce((acc, curr) => acc + curr.boardedCount, 0);

  const handleNotifyParentsOfDelay = (route: BusRoute) => {
    setToastNotice(`✓ Automated WhatsApp & Push alerts dispatched to all ${route.boardedCount} parents on ${route.routeNumber} regarding ${route.delayMins || 5}-minute traffic delay!`);
    setTimeout(() => setToastNotice(null), 6000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{activeSchool.name} • Live Fleet & GPS Radar Command</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              School Bus Fleet & RFID Passenger Telemetry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time GPS bus tracking, biometric RFID student boarding manifests, route stop delays, and automated parent push alerts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>GPS Satellites Online (14/14 Active)</span>
            </div>
          </div>
        </div>

        {/* Toast Alert */}
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet Strength</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{routes.length} Active Routes</div>
              <div className="text-xs text-slate-500 font-medium mt-1">100% AIS-140 GPS Compliant</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>RTO Fitness & Speed Governors Valid</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Boarded Cadets</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">
                {totalBoarded} / {totalCapacity}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {Math.round((totalBoarded / (totalCapacity || 1)) * 100)}% Bus Capacity Booked
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RFID Biometrics Tagged</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet On-Time Rate</span>
              <div className="text-3xl font-extrabold text-indigo-700 mt-2 font-mono">98.2%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Average Campus Arrival at 08:11 AM</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700">
              <span>Smart AI Route Optimization</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Speed Governance</span>
              <div className="text-3xl font-extrabold text-cyan-700 mt-2 font-mono">34 km/h</div>
              <div className="text-xs text-slate-500 font-medium mt-1">City Limit: Max 40 km/h Enforced</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-cyan-700 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Zero Speed Violations Logged</span>
            </div>
          </Card>
        </div>

        {/* Live Route Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Active GPS Bus Corridors & Telemetry</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Auto-refreshes every 3 seconds</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {routes.map((route) => (
              <Card key={route.id} className="light-glass p-5 rounded-3xl border border-slate-200/80 shadow-xs luxury-card-hover flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={route.status === 'ARRIVED' ? 'success' : route.status === 'ON_TIME' ? 'cyan' : 'destructive'}>
                        {route.status}
                      </Badge>
                      <span className="font-extrabold text-xs text-slate-900">{route.routeNumber}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-500">{route.currentSpeed}</span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 mt-1">{route.routeName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Driver: {route.driverName} ({route.driverPhone})</div>
                  <div className="text-[11px] text-slate-500">Bus Plate: {route.vehicleNumber}</div>

                  {/* Real-time Location Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1 shadow-inner">
                    <div className="text-emerald-400 font-bold flex items-center justify-between">
                      <span>● LIVE RADAR</span>
                      <span>{route.boardedCount}/{route.capacity} On Board</span>
                    </div>
                    <div className="text-slate-300 truncate">Loc: {route.currentLocation}</div>
                    {route.delayMins && (
                      <div className="text-amber-400 font-bold">⚠️ Delay: +{route.delayMins} Mins (Heavy Paud Rd Traffic)</div>
                    )}
                  </div>

                  {/* Stop Progress Tracker */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-500">Corridor Stop Checkpoints:</div>
                    <div className="space-y-1 text-xs">
                      {route.stops.map((stop, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between">
                          <span className={`text-[11px] ${
                            stop.status === 'COMPLETED' ? 'text-slate-400 line-through' : stop.status === 'NEXT' ? 'text-emerald-700 font-bold' : 'text-slate-700'
                          }`}>
                            {stop.status === 'COMPLETED' ? '✓ ' : stop.status === 'NEXT' ? '➤ ' : '○ '}
                            {stop.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{stop.scheduledTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNotifyParentsOfDelay(route)}
                    className="font-bold text-xs h-8 border-slate-200 text-slate-700 hover:text-indigo-700"
                  >
                    <Bell className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    <span>Alert Parents</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => setSelectedRouteForManifest(route)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5 mr-1" />
                    <span>Passenger Manifest</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Passenger Manifest Drawer / Modal */}
        {selectedRouteForManifest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {selectedRouteForManifest.routeNumber} - Passenger Boarding Manifest
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Driver: {selectedRouteForManifest.driverName} • Vehicle: {selectedRouteForManifest.vehicleNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRouteForManifest(null)}
                  className="text-slate-400 hover:text-slate-700 p-2 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Passengers Table */}
              <div className="my-5 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600">
                      <th className="p-3">Student Cadet</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">RFID Tag</th>
                      <th className="p-3">Boarding Timestamp</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRouteForManifest.passengers.map((p) => (
                      <tr key={p.studentId} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-900">{p.studentName}</td>
                        <td className="p-3 text-slate-600">{p.grade}</td>
                        <td className="p-3 font-mono text-indigo-700 font-bold">{p.rfidTag}</td>
                        <td className="p-3 text-slate-600">{p.boardedAt}</td>
                        <td className="p-3 text-right">
                          <Badge variant={p.status === 'BOARDED' ? 'success' : 'warning'}>
                            {p.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <div className="text-slate-500 font-medium">
                  Direct emergency driver hotline: <strong className="text-slate-800">{selectedRouteForManifest.driverPhone}</strong>
                </div>
                <Button
                  onClick={() => setSelectedRouteForManifest(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Close Manifest
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
