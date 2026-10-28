"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bus, MapPin, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function TransportFleetRadar() {
  const fleet = [
    { id: 'BUS-01', route: 'North Sector', status: 'on_time', speed: 45, nextStop: 'Oakwood Estate', eta: '5 mins' },
    { id: 'BUS-02', route: 'Downtown Loop', status: 'delayed', speed: 12, nextStop: 'City Center', eta: '15 mins (Heavy Traffic)' },
    { id: 'BUS-03', route: 'West End', status: 'on_time', speed: 50, nextStop: 'Pine Hill', eta: '2 mins' },
    { id: 'BUS-04', route: 'East Suburbs', status: 'maintenance', speed: 0, nextStop: 'N/A', eta: 'N/A' },
  ];

  return (
    <Card className="light-glass card-hover text-slate-900 border-indigo-100/50">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Live Transport Fleet Radar
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">Real-time GPS tracking and route telemetry</span>
          </div>
        </div>
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-3 py-1 text-xs">
          4 Vehicles Active
        </Badge>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {fleet.map((bus) => (
            <div key={bus.id} className="relative p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between hover:border-amber-300 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{bus.id}</h4>
                  <span className="text-xs text-slate-500 font-medium">{bus.route}</span>
                </div>
                {bus.status === 'on_time' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {bus.status === 'delayed' && <Clock className="w-5 h-5 text-amber-500" />}
                {bus.status === 'maintenance' && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{bus.nextStop}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Speed</div>
                  <div className="text-xs font-bold text-slate-700">{bus.speed > 0 ? `${bus.speed} km/h` : 'Stopped'}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ETA</div>
                  <div className={`text-xs font-bold ${bus.status === 'delayed' ? 'text-amber-600' : 'text-slate-700'}`}>
                    {bus.eta}
                  </div>
                </div>
              </div>

              {/* Status Indicator Bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl ${
                bus.status === 'on_time' ? 'bg-emerald-400' : 
                bus.status === 'delayed' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
