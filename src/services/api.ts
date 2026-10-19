import {
  Provider,
  Ngo,
  Place,
  PlaceEnlistment,
  Offer,
  DistributionPlan,
  ServeReport,
  AuthUser
} from '../types';
import {
  INITIAL_PROVIDERS,
  INITIAL_NGOS,
  INITIAL_PLACES,
  INITIAL_ENLISTMENTS,
  INITIAL_OFFERS,
  INITIAL_PLANS,
  INITIAL_SERVE_REPORTS
} from '../data/mockData';
import { generatePickupCode } from '../utils/rules';

const STORAGE_KEYS = {
  PROVIDERS: 'annasetu_providers_v1',
  NGOS: 'annasetu_ngos_v1',
  PLACES: 'annasetu_places_v1',
  ENLISTMENTS: 'annasetu_enlistments_v1',
  OFFERS: 'annasetu_offers_v1',
  PLANS: 'annasetu_plans_v1',
  SERVE_REPORTS: 'annasetu_reports_v1',
  AUTH_USER: 'annasetu_auth_user_v1'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export const api = {
  // Auth
  getCurrentUser(): AuthUser | null {
    return getStorage<AuthUser | null>(STORAGE_KEYS.AUTH_USER, null);
  },

  setCurrentUser(user: AuthUser | null): void {
    setStorage(STORAGE_KEYS.AUTH_USER, user);
  },

  // Reset demo data
  resetAll(): void {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(INITIAL_PROVIDERS));
    localStorage.setItem(STORAGE_KEYS.NGOS, JSON.stringify(INITIAL_NGOS));
    localStorage.setItem(STORAGE_KEYS.PLACES, JSON.stringify(INITIAL_PLACES));
    localStorage.setItem(STORAGE_KEYS.ENLISTMENTS, JSON.stringify(INITIAL_ENLISTMENTS));
    localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(INITIAL_OFFERS));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(INITIAL_PLANS));
    localStorage.setItem(STORAGE_KEYS.SERVE_REPORTS, JSON.stringify(INITIAL_SERVE_REPORTS));
  },

  // Providers
  getProviders(): Provider[] {
    return getStorage<Provider[]>(STORAGE_KEYS.PROVIDERS, INITIAL_PROVIDERS);
  },

  getProviderById(id: string): Provider | undefined {
    return this.getProviders().find(p => p.id === id);
  },

  createProvider(data: Omit<Provider, 'id' | 'createdAt' | 'verified'>): Provider {
    const providers = this.getProviders();
    const newProv: Provider = {
      ...data,
      id: `prov-${Date.now()}`,
      verified: true, // Auto-switched to verified (demo)
      createdAt: new Date().toISOString()
    };
    providers.unshift(newProv);
    setStorage(STORAGE_KEYS.PROVIDERS, providers);
    return newProv;
  },

  updateProvider(id: string, data: Partial<Provider>): Provider | null {
    const providers = this.getProviders();
    const idx = providers.findIndex(p => p.id === id);
    if (idx === -1) return null;
    providers[idx] = { ...providers[idx], ...data };
    setStorage(STORAGE_KEYS.PROVIDERS, providers);
    return providers[idx];
  },

  // NGOs
  getNgos(): Ngo[] {
    return getStorage<Ngo[]>(STORAGE_KEYS.NGOS, INITIAL_NGOS);
  },

  getNgoById(id: string): Ngo | undefined {
    return this.getNgos().find(n => n.id === id);
  },

  createNgo(data: Omit<Ngo, 'id' | 'createdAt' | 'verified'>): Ngo {
    const ngos = this.getNgos();
    const newNgo: Ngo = {
      ...data,
      id: `ngo-${Date.now()}`,
      verified: true, // Auto-switched to verified (demo)
      createdAt: new Date().toISOString()
    };
    ngos.unshift(newNgo);
    setStorage(STORAGE_KEYS.NGOS, ngos);
    return newNgo;
  },

  updateNgo(id: string, data: Partial<Ngo>): Ngo | null {
    const ngos = this.getNgos();
    const idx = ngos.findIndex(n => n.id === id);
    if (idx === -1) return null;
    ngos[idx] = { ...ngos[idx], ...data };
    setStorage(STORAGE_KEYS.NGOS, ngos);
    return ngos[idx];
  },

  // Places in Need
  getPlaces(): Place[] {
    return getStorage<Place[]>(STORAGE_KEYS.PLACES, INITIAL_PLACES);
  },

  getPlaceById(id: string): Place | undefined {
    return this.getPlaces().find(p => p.id === id);
  },

  createPlace(data: Omit<Place, 'id' | 'reviewStatus'>): Place {
    const places = this.getPlaces();
    const newPlace: Place = {
      ...data,
      id: `place-${Date.now()}`,
      reviewStatus: 'pending_review' // Shows as Pending review (demo)
    };
    places.unshift(newPlace);
    setStorage(STORAGE_KEYS.PLACES, places);
    return newPlace;
  },

  // Enlistments
  getEnlistments(): PlaceEnlistment[] {
    return getStorage<PlaceEnlistment[]>(STORAGE_KEYS.ENLISTMENTS, INITIAL_ENLISTMENTS);
  },

  enlistNgoAtPlace(placeId: string, ngoId: string, status: 'planning' | 'active'): PlaceEnlistment {
    const enlistments = this.getEnlistments();
    const existingIdx = enlistments.findIndex(e => e.placeId === placeId && e.ngoId === ngoId);
    if (existingIdx !== -1) {
      enlistments[existingIdx].status = status;
      enlistments[existingIdx].updatedAt = new Date().toISOString();
      setStorage(STORAGE_KEYS.ENLISTMENTS, enlistments);
      return enlistments[existingIdx];
    }
    const newEnl: PlaceEnlistment = {
      id: `enl-${Date.now()}`,
      placeId,
      ngoId,
      status,
      updatedAt: new Date().toISOString()
    };
    enlistments.push(newEnl);
    setStorage(STORAGE_KEYS.ENLISTMENTS, enlistments);
    return newEnl;
  },

  // Offers
  getOffers(): Offer[] {
    return getStorage<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  },

  getOfferById(id: string): Offer | undefined {
    return this.getOffers().find(o => o.id === id);
  },

  createOffer(data: Omit<Offer, 'id' | 'createdAt' | 'status'>): Offer {
    const offers = this.getOffers();
    const newOffer: Offer = {
      ...data,
      id: `off-${Date.now()}`,
      status: 'AVAILABLE',
      createdAt: new Date().toISOString()
    };
    offers.unshift(newOffer);
    setStorage(STORAGE_KEYS.OFFERS, offers);
    return newOffer;
  },

  updateOffer(id: string, partial: Partial<Offer>): Offer | null {
    const offers = this.getOffers();
    const idx = offers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    offers[idx] = { ...offers[idx], ...partial };
    setStorage(STORAGE_KEYS.OFFERS, offers);
    return offers[idx];
  },

  // Check and expire stale offers
  expireStaleOffers(currentSimulatedTimeMs: number): number {
    const offers = this.getOffers();
    let expiredCount = 0;
    const updated = offers.map(o => {
      if ((o.status === 'AVAILABLE' || o.status === 'REQUESTED') && new Date(o.safeUntil).getTime() <= currentSimulatedTimeMs) {
        expiredCount++;
        return { ...o, status: 'EXPIRED' as const };
      }
      return o;
    });
    if (expiredCount > 0) {
      setStorage(STORAGE_KEYS.OFFERS, updated);
    }
    return expiredCount;
  },

  // Distribution Plans
  getPlans(): DistributionPlan[] {
    return getStorage<DistributionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
  },

  createDistributionPlan(data: Omit<DistributionPlan, 'id' | 'createdAt' | 'status'>): DistributionPlan {
    const plans = this.getPlans();
    const newPlan: DistributionPlan = {
      ...data,
      id: `plan-${Date.now()}`,
      status: 'submitted',
      createdAt: new Date().toISOString()
    };
    plans.unshift(newPlan);
    setStorage(STORAGE_KEYS.PLANS, plans);

    // Update Offer status to REQUESTED
    this.updateOffer(data.offerId, { status: 'REQUESTED' });

    // NGO automatically listed under that place as Planning
    this.enlistNgoAtPlace(data.placeId, data.ngoId, 'planning');

    return newPlan;
  },

  confirmDistributionPlan(planId: string): { plan: DistributionPlan; code: string } | null {
    const plans = this.getPlans();
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return null;

    const code = generatePickupCode();
    targetPlan.status = 'confirmed';
    targetPlan.confirmedAt = new Date().toISOString();

    // First valid confirmed request wins:
    // Update offer to CONFIRMED with code and allocated NGO
    this.updateOffer(targetPlan.offerId, {
      status: 'CONFIRMED',
      pickupCode: code,
      allocatedNgoId: targetPlan.ngoId,
      platesAvailable: 0
    });

    // Decline any other competing requests for this same offer
    plans.forEach(p => {
      if (p.offerId === targetPlan.offerId && p.id !== targetPlan.id && p.status === 'submitted') {
        p.status = 'declined';
        p.declineReason = 'Offer already allocated to another NGO.';
      }
    });

    setStorage(STORAGE_KEYS.PLANS, plans);
    return { plan: targetPlan, code };
  },

  declineDistributionPlan(planId: string, reason: string): DistributionPlan | null {
    const plans = this.getPlans();
    const plan = plans.find(p => p.id === planId);
    if (!plan) return null;

    plan.status = 'declined';
    plan.declineReason = reason || 'Declined by provider.';
    setStorage(STORAGE_KEYS.PLANS, plans);

    // If there are no other submitted plans for this offer, return offer status to AVAILABLE
    const otherPending = plans.some(p => p.offerId === plan.offerId && p.status === 'submitted');
    if (!otherPending) {
      this.updateOffer(plan.offerId, { status: 'AVAILABLE' });
    }

    return plan;
  },

  // Pickup Handover verification
  markCollected(offerId: string, inputCode: string): { success: boolean; message: string } {
    const offer = this.getOfferById(offerId);
    if (!offer) return { success: false, message: 'Offer not found.' };

    if (!offer.pickupCode) {
      return { success: false, message: 'No pickup code generated yet.' };
    }

    if (offer.pickupCode.trim() !== inputCode.trim()) {
      return { success: false, message: 'Invalid 4-digit handover code. Please check with the NGO.' };
    }

    this.updateOffer(offerId, { status: 'COLLECTED' });
    return { success: true, message: 'Food collection verified and marked COLLECTED!' };
  },

  // Serve Reports
  getServeReports(): ServeReport[] {
    return getStorage<ServeReport[]>(STORAGE_KEYS.SERVE_REPORTS, INITIAL_SERVE_REPORTS);
  },

  createServeReport(data: Omit<ServeReport, 'id' | 'createdAt' | 'providerConfirmed' | 'providerThanked'>): ServeReport {
    const reports = this.getServeReports();
    const newReport: ServeReport = {
      ...data,
      id: `rep-${Date.now()}`,
      providerConfirmed: false,
      providerThanked: false,
      createdAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    setStorage(STORAGE_KEYS.SERVE_REPORTS, reports);

    // Update Offer status to SERVED
    this.updateOffer(data.offerId, { status: 'SERVED' });

    // NGO is now active at this place
    this.enlistNgoAtPlace(data.placeId, data.ngoId, 'active');

    return newReport;
  },

  thankAndConfirmServeReport(reportId: string): ServeReport | null {
    const reports = this.getServeReports();
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return null;

    rep.providerConfirmed = true;
    rep.providerThanked = true;
    setStorage(STORAGE_KEYS.SERVE_REPORTS, reports);
    return rep;
  },

  // Simulations for demo
  simulateNewOffer(): Offer {
    const randomItems = [
      'Paneer Makhani, Jeera Rice & 60 Tandoori Rotis',
      'Hyderabadi Veg Biryani, Mirchi Ka Salan, Raita',
      'Maharashtrian Varan Bhaat, Batata Bhaji, Puri (50 Plates)',
      'Fresh Day-End Milk Bread Loaves (40) & Veg Croissants',
      'Kadhi Khichdi, Masala Papad & Gulab Jamun (70 plates)'
    ];
    const providers = this.getProviders();
    const chosenProvider = providers[Math.floor(Math.random() * providers.length)];
    const chosenItem = randomItems[Math.floor(Math.random() * randomItems.length)];
    const plates = [40, 55, 70, 85, 100][Math.floor(Math.random() * 5)];

    const now = Date.now();
    return this.createOffer({
      providerId: chosenProvider.id,
      items: chosenItem,
      foodType: 'cooked_curry_rice',
      platesTotal: plates,
      platesAvailable: plates,
      isVeg: true,
      packing: 'Packed in sanitized stainless steel milk cans and insulated tubs',
      pickupFrom: 'Immediately',
      pickupTo: 'Within 2 hours',
      safeUntil: new Date(now + 2.5 * 3600 * 1000).toISOString(),
      location: `${chosenProvider.orgName}, ${chosenProvider.locality}`,
      notes: 'Freshly prepared surplus. Demo simulation trigger.'
    });
  },

  simulateNgoRequest(offerId?: string): DistributionPlan | null {
    const offers = this.getOffers().filter(o => o.status === 'AVAILABLE');
    if (offers.length === 0) return null;

    const targetOffer = offerId ? offers.find(o => o.id === offerId) || offers[0] : offers[0];
    const ngos = this.getNgos();
    const places = this.getPlaces();
    const chosenNgo = ngos[Math.floor(Math.random() * ngos.length)];
    const chosenPlace = places[Math.floor(Math.random() * places.length)];

    return this.createDistributionPlan({
      offerId: targetOffer.id,
      ngoId: chosenNgo.id,
      placeId: chosenPlace.id,
      beneficiaries: Math.min(targetOffer.platesAvailable, chosenPlace.beneficiaries),
      meal: 'dinner',
      platesRequested: targetOffer.platesAvailable,
      collectorName: chosenNgo.contact.split('(')[0].trim(),
      collectorPhone: chosenNgo.phone,
      vehicle: chosenNgo.hasVehicle ? 'Insulated Volunteer Utility Van' : 'Volunteer Motorbike carriers',
      pickupTime: 'Within 45 mins',
      servingTime: 'Within 1.5 hrs',
      purposeNote: `Simulated request: Feeding ${chosenPlace.beneficiaries} residents at ${chosenPlace.name}.`,
      declarationHygiene: true,
      declarationReport: true
    });
  }
};
