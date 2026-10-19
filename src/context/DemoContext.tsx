import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface DemoContextType {
  simulatedTimeMs: number;
  timeSpeed: 1 | 60 | 300;
  setTimeSpeed: (speed: 1 | 60 | 300) => void;
  triggerSimulateNewOffer: () => void;
  triggerSimulateNgoRequest: (offerId?: string) => void;
  triggerAutoServeReport: () => void;
  resetAllDemoData: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshKey: number;
  triggerDataRefresh: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulatedTimeMs, setSimulatedTimeMs] = useState<number>(Date.now());
  const [timeSpeed, setTimeSpeed] = useState<1 | 60 | 300>(1);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerDataRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Clock ticker with accelerated speed
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedTimeMs(prev => {
        const nextTime = prev + (1000 * timeSpeed);
        // Periodically check for expired offers
        const expired = api.expireStaleOffers(nextTime);
        if (expired > 0) {
          triggerDataRefresh();
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeSpeed]);

  const triggerSimulateNewOffer = () => {
    const offer = api.simulateNewOffer();
    triggerDataRefresh();
    addToast({
      type: 'info',
      title: 'New Surplus Listed (Simulated)',
      message: `${offer.items} (${offer.platesTotal} plates) posted by a nearby donor.`
    });
  };

  const triggerSimulateNgoRequest = (offerId?: string) => {
    const plan = api.simulateNgoRequest(offerId);
    if (!plan) {
      addToast({
        type: 'warning',
        title: 'No Available Offers',
        message: 'All current offers are already requested or confirmed.'
      });
      return;
    }
    triggerDataRefresh();
    addToast({
      type: 'info',
      title: 'New NGO Request Received (Simulated)',
      message: `An NGO has submitted a distribution plan for ${plan.platesRequested} plates!`
    });
  };

  const triggerAutoServeReport = () => {
    const offers = api.getOffers();
    const plans = api.getPlans();
    const reports = api.getServeReports();
    const reportedPlanIds = new Set(reports.map(r => r.planId));

    // Find any plan that is confirmed or collected without a report
    const eligiblePlan = plans.find(p => p.status === 'confirmed' && !reportedPlanIds.has(p.id));
    if (!eligiblePlan) {
      // Pick any plan and simulate a report
      const anyPlan = plans[0];
      const newRep = api.createServeReport({
        planId: anyPlan.id,
        offerId: anyPlan.offerId,
        ngoId: anyPlan.ngoId,
        providerId: 'prov-1',
        placeId: anyPlan.placeId,
        platesServed: anyPlan.platesRequested,
        peopleFed: anyPlan.beneficiaries,
        servedAt: new Date().toISOString(),
        photos: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'],
        note: 'Distribution completed smoothly with smiles all around! Every single plate was utilized properly.',
        leftoverNote: 'Zero wastage recorded.'
      });
      triggerDataRefresh();
      addToast({
        type: 'success',
        title: 'Serve Report Published (Simulated)',
        message: `Verified report added for ${newRep.platesServed} plates served.`
      });
      return;
    }

    const offer = offers.find(o => o.id === eligiblePlan.offerId);
    const newRep = api.createServeReport({
      planId: eligiblePlan.id,
      offerId: eligiblePlan.offerId,
      ngoId: eligiblePlan.ngoId,
      providerId: offer ? offer.providerId : 'prov-1',
      placeId: eligiblePlan.placeId,
      platesServed: eligiblePlan.platesRequested,
      peopleFed: eligiblePlan.beneficiaries,
      servedAt: new Date().toISOString(),
      photos: ['https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80'],
      note: 'Demo Report: Hot meals distributed to all residents. Food was warm, aromatic, and hygienically portioned out.',
      leftoverNote: 'All plates exhausted, no leftover.'
    });

    triggerDataRefresh();
    addToast({
      type: 'success',
      title: 'Serve Report Generated',
      message: `Report posted for ${newRep.platesServed} plates served.`
    });
  };

  const resetAllDemoData = () => {
    api.resetAll();
    setSimulatedTimeMs(Date.now());
    setTimeSpeed(1);
    triggerDataRefresh();
    addToast({
      type: 'warning',
      title: 'Data Reset',
      message: 'All records have been restored to initial sample state.'
    });
  };

  return (
    <DemoContext.Provider
      value={{
        simulatedTimeMs,
        timeSpeed,
        setTimeSpeed,
        triggerSimulateNewOffer,
        triggerSimulateNgoRequest,
        triggerAutoServeReport,
        resetAllDemoData,
        toasts,
        addToast,
        removeToast,
        refreshKey,
        triggerDataRefresh
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
};
