import React, { useState } from 'react';
import { CampSite, SiteBookingForm, BoardingPass } from '../types';
import { StorageService } from '../services/storage';
import { 
  Calendar, 
  Car, 
  Users, 
  Ticket, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Zap, 
  Flame, 
  Waves, 
  ShieldCheck,
  CreditCard,
  ArrowRight,
  X
} from 'lucide-react';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: CampSite[];
  onBookingComplete: (newPass: BoardingPass) => void;
  initialSelectedSiteId?: string;
}

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  sites,
  onBookingComplete,
  initialSelectedSiteId
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(initialSelectedSiteId || sites[0]?.id || 'site-a1');
  const [checkInDate, setCheckInDate] = useState('2026-08-28');
  const [checkOutDate, setCheckOutDate] = useState('2026-08-31');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([
    'Main North Boom Gate (Auto-ANPR & NFC)',
    'Sunset Beach Heated Ablution & UV Shower Block'
  ]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingConfirmedPass, setBookingConfirmedPass] = useState<BoardingPass | null>(null);

  if (!isOpen) return null;

  const currentSelectedSite = sites.find(s => s.id === selectedSiteId) || sites[0];

  // Calculate nights
  const start = new Date(checkInDate).getTime();
  const end = new Date(checkOutDate).getTime();
  const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) || 3);

  // Add-on price catalogue
  const ADD_ON_CATALOGUE = [
    { id: 'add-surf-board', title: 'Port Waikato Surf Academy Board & Wetsuit Hire', priceNzd: 45 },
    { id: 'add-firewood', title: 'Kiln-Dried Native Firewood Bundle + Enclosed Fire Table', priceNzd: 25 },
    { id: 'add-hamper', title: 'Sunset Beach Café Welcome Gourmet Picnic Hamper', priceNzd: 65 },
    { id: 'add-kayak', title: 'Riverfront Kayak & Lifejacket 2-Day Pass', priceNzd: 40 },
    { id: 'add-ev-charge', title: 'Unlimited 50A EV Rapid Pedestal Charging', priceNzd: 30 }
  ];

  const toggleAddOn = (title: string) => {
    if (selectedAddOns.includes(title)) {
      setSelectedAddOns(selectedAddOns.filter(a => a !== title));
    } else {
      setSelectedAddOns([...selectedAddOns, title]);
    }
  };

  const addOnTotal = ADD_ON_CATALOGUE
    .filter(a => selectedAddOns.includes(a.title))
    .reduce((sum, a) => sum + a.priceNzd, 0);

  const basePriceTotal = (currentSelectedSite?.pricePerNight || 110) * nights;
  const grandTotalNzd = basePriceTotal + addOnTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    const bookingPayload: SiteBookingForm = {
      siteId: selectedSiteId,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim() || 'guest@aotearoaholidaypark.co.nz',
      guestPhone: guestPhone.trim() || '+64 21 000 0000',
      vehiclePlate: vehiclePlate.trim() || 'NZ-ANPR-AUTO',
      vehicleModel: vehicleModel.trim() || 'Campervan / Touring Vehicle',
      checkInDate,
      checkOutDate,
      partySize,
      selectedAddOns,
      specialRequests
    };

    const newPass = StorageService.createSiteBooking(bookingPayload);
    setBookingConfirmedPass(newPass);
  };

  const handleFinishAndOpenPass = () => {
    if (bookingConfirmedPass) {
      onBookingComplete(bookingConfirmedPass);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn relative my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                AOTEAROA HOLIDAY PARK • PORT WAIKATO
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Book Stay & Generate Boarding Pass
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 bg-stone-800/80 hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation Screen View */}
        {bookingConfirmedPass ? (
          <div className="space-y-6 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-stone-100">Booking Confirmed!</h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                Your Aotearoa Holiday Park reservation is verified. Your offline-resilient Boarding Pass and smart barrier token are ready.
              </p>
            </div>

            {/* Mini Pass Preview Box */}
            <div className="bg-stone-950 border border-amber-500/40 rounded-2xl p-5 text-left space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold pb-2 border-b border-stone-800">
                <span>PASS: {bookingConfirmedPass.confirmationCode}</span>
                <span>SITE: {bookingConfirmedPass.siteNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                <div>Guest: <strong className="text-stone-100">{bookingConfirmedPass.guestName}</strong></div>
                <div>Vehicle Plate: <strong className="text-amber-300">{bookingConfirmedPass.vehiclePlate}</strong></div>
                <div>Check-in: {bookingConfirmedPass.checkInDate}</div>
                <div>Check-out: {bookingConfirmedPass.checkOutDate}</div>
                <div>Lock Code: <strong className="text-emerald-400 font-bold">{bookingConfirmedPass.smartLockCode}</strong></div>
                <div>TOTP: <strong className="text-teal-400">{bookingConfirmedPass.offlineTotpHash}</strong></div>
              </div>
            </div>

            <button
              id="btn-view-minted-boarding-pass"
              onClick={handleFinishAndOpenPass}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-sm tracking-wide shadow-xl shadow-amber-950/50 transition-all flex items-center justify-center space-x-2"
            >
              <Ticket className="w-5 h-5" />
              <span>Launch Boarding Pass & Digital Key</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Select Site */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-stone-400 font-bold block">
                1. Select Accommodation / Pitch
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {sites.map(site => (
                  <div
                    key={site.id}
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedSiteId === site.id
                        ? 'bg-amber-950/40 border-amber-500 text-stone-100 shadow-md'
                        : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">{site.number}</span>
                      <span className="text-xs font-mono font-bold text-stone-200">${site.pricePerNight} NZD/nt</span>
                    </div>
                    <div className="text-xs font-bold text-stone-200 mt-1 truncate">{site.name}</div>
                    <div className="text-[10px] text-stone-500 truncate">{site.zone} • Max {site.maxOccupancy} Guests</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Dates & Party */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-stone-400 font-bold block">
                2. Stay Window & Party Size
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-stone-400 block mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-stone-400 block mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-stone-400 block mb-1">Party Size</label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                      <option key={n} value={n}>{n} Guests</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Guest & Vehicle Info */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-stone-400 font-bold block">
                3. Primary Guest & Vehicle Tag (for ANPR Gate Access)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (e.g. Aroha Taylor)"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Phone (e.g. +64 21 883 910)"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Vehicle Plate (e.g. KPT-889)"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Vehicle / Camper Model (e.g. Kea Breeze 4-Berth)"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Community & Local Add-ons */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-stone-400 font-bold block">
                4. Port Waikato Experiences & Site Add-ons
              </label>
              <div className="space-y-2">
                {ADD_ON_CATALOGUE.map(addon => {
                  const isSelected = selectedAddOns.includes(addon.title);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.title)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? 'bg-teal-950/40 border-teal-500/70 text-stone-200'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-teal-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate">{addon.title}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-400 shrink-0">+${addon.priceNzd} NZD</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary & Submit Bar */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-400">
                  {nights} Nights x ${currentSelectedSite?.pricePerNight} + ${addOnTotal} Add-ons:
                </div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  ${grandTotalNzd} <span className="text-xs text-stone-300 font-normal">NZD (GST Incl.)</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-800 text-stone-300 hover:bg-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-amber-950/50 transition-all flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Generate Pass</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
