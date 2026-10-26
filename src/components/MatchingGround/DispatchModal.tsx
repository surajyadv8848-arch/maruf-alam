import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Phone, MapPin, Send, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Donor, BloodComponent, BloodGroup } from '../../types/blood';

interface DispatchModalProps {
  donor: Donor;
  recipientBloodType: BloodGroup;
  recipientName: string;
  component: BloodComponent;
  onClose: () => void;
  onConfirmReservation: (donorId: string) => void;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  donor,
  recipientBloodType,
  recipientName,
  component,
  onClose,
  onConfirmReservation,
}) => {
  const [step, setStep] = useState<'REVIEW' | 'DISPATCHING' | 'CONFIRMED'>('REVIEW');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  useEffect(() => {
    // Calculate realistic ETA based on distance
    const time = Math.max(15, Math.round(donor.distanceKm * 2.8) + 10);
    setEstimatedMinutes(time);
  }, [donor]);

  const handleSendDispatch = () => {
    setStep('DISPATCHING');
    setTimeout(() => {
      setStep('CONFIRMED');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#e11d48', '#fb7185', '#fda4af', '#10b981'],
      });
      onConfirmReservation(donor.id);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {step === 'CONFIRMED' ? 'Emergency Reservation Confirmed' : 'Dispatch Donor Call & Reserve Unit'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rapid response coordination channel
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'REVIEW' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                      Target Transfusion Pair
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {recipientName} ({recipientBloodType})
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Required: <span className="font-semibold text-rose-700">{component}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Selected Donor</span>
                    <p className="text-sm font-bold text-slate-900 mt-1">{donor.fullName}</p>
                    <span className="inline-block text-xs font-bold text-rose-700 bg-white border border-rose-200 px-2 py-0.5 rounded mt-0.5">
                      Type {donor.bloodType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" /> Location / Zone
                  </span>
                  <span className="font-medium text-slate-900">{donor.city} ({donor.distanceKm} km)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" /> Estimated Transit Time
                  </span>
                  <span className="font-medium text-slate-900">~{estimatedMinutes} minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" /> Donor Contact
                  </span>
                  <span className="font-medium text-slate-900">{donor.phone}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <span className="font-semibold block mb-0.5">Automated Dispatch Protocol:</span>
                This will trigger an emergency SMS notification to the donor's mobile device, place the unit on 2-hour clinical hold, and notify the transfusion laboratory.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendDispatch}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Dispatch Alert</span>
                </button>
              </div>
            </div>
          )}

          {step === 'DISPATCHING' && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-block relative">
                <div className="w-12 h-12 rounded-full border-4 border-rose-200 border-t-rose-600 animate-spin"></div>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Transmitting Emergency Blood Request...</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Connecting to donor communications gateway and checking blood bank inventory locks.
              </p>
            </div>
          )}

          {step === 'CONFIRMED' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Donor Acknowledgment Received</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {donor.fullName} confirmed availability. Unit status updated in local transfusion registry.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reservation Tracking ID:</span>
                  <span className="font-mono font-bold text-slate-800">RES-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transfusion Unit:</span>
                  <span className="font-medium text-slate-800">{component} (Type {donor.bloodType})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recipient:</span>
                  <span className="font-medium text-slate-800">{recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Arrival:</span>
                  <span className="font-medium text-emerald-700">Within {estimatedMinutes} mins</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Done & Return to Ground</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
