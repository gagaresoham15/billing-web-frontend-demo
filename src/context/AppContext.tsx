import React, { createContext, useContext, useState } from 'react';
import type {
  ScreenId,
  Bill,
  Product,
  Workspace,
  UserProfile,
  SubscriptionPlan,
  ActiveSubscription,
} from '../types';

interface AppContextType {
  currentScreen: ScreenId;
  setCurrentScreen: (screen: ScreenId) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (ws: Omit<Workspace, 'id'>) => void;
  user: UserProfile;
  updateUser: (user: Partial<UserProfile>) => void;
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan;
  setSelectedPlan: (plan: SubscriptionPlan) => void;
  paymentMethod: 'online' | 'manual';
  setPaymentMethod: (method: 'online' | 'manual') => void;
  subscription: ActiveSubscription;
  setSubscriptionData: (sub: ActiveSubscription) => void;
  activateSubscription: (planName: string, days: number) => void;
  selectedBillForPreview: Bill | null;
  setSelectedBillForPreview: (bill: Bill | null) => void;
  isCreateBillOpen: boolean;
  setIsCreateBillOpen: (open: boolean) => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: (open: boolean) => void;
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: '66946b56-8be2-41c6-a2a7-fc7388b08c70',
    name: 'mauli event sakur',
    category: 'GROCERY STORE',
    address: 'mandve kh',
    tag: 'GROCERY STORE',
    iconBg: '#ec4899',
    isActive: true,
  },
  {
    id: '85ee707f-9d77-425a-8649-cde772cf7036',
    name: 'महावीर टेक्सटाइल मार्केट',
    category: 'GROCERY STORE',
    address: 'Takli Dhokeshwar Parner',
    tag: 'GROCERY STORE',
    iconBg: '#3b82f6',
    isActive: false,
  },
  {
    id: '60bea850-3631-4846-a686-83a842036d6f',
    name: 'malveer electrical',
    category: 'GROCERY STORE',
    address: 'palshi',
    tag: 'GROCERY STORE',
    iconBg: '#10b981',
    isActive: false,
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'b-5',
    billNumber: 'MES-5',
    customer: 'pawan',
    mobile: '9579494118',
    dateTime: '03 Sep 2026 10:24 AM',
    amount: 480,
    paymentMethod: 'Cash',
    items: [{ id: 'i1', name: 'ponds cream', qty: 2, rate: 240, total: 480 }],
  },
  {
    id: 'b-4',
    billNumber: 'MES-4',
    customer: 'soham',
    mobile: '8668965024',
    dateTime: '03 Sep 2026 09:46 AM',
    amount: 100,
    paymentMethod: 'Cash',
    items: [{ id: 'i2', name: 'krackjack 10pk', qty: 10, rate: 10, total: 100 }],
  },
  {
    id: 'b-3',
    billNumber: 'MES-3',
    customer: 'swaraj jadhav',
    mobile: '8888569891',
    dateTime: '02 Sep 2026 07:39 AM',
    amount: 75,
    paymentMethod: 'Online',
    items: [{ id: 'i3', name: 'head oil 3pk', qty: 3, rate: 25, total: 75 }],
  },
  {
    id: 'b-2',
    billNumber: 'MES-2',
    customer: 'Ashwini jadhav',
    mobile: '7499837005',
    dateTime: '28 Aug 2026 07:17 PM',
    amount: 50,
    paymentMethod: 'Online',
    items: [{ id: 'i4', name: 'Snacks assorted', qty: 5, rate: 10, total: 50 }],
  },
  {
    id: 'b-1',
    billNumber: 'MES-1',
    customer: 'swaraj jadhav',
    mobile: '8888569891',
    dateTime: '28 Aug 2026 01:25 PM',
    amount: 95,
    paymentMethod: 'Cash',
    items: [{ id: 'i5', name: 'Grocery pack', qty: 1, rate: 95, total: 95 }],
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'ponds', category: 'Beauty', stock: 93, cost: 10, price: 15 },
  { id: 2, name: 'Fan', category: 'Electronics', stock: 100, cost: 500, price: 1000 },
  { id: 3, name: 'krackjack', category: 'Snacks', stock: 95, cost: 8, price: 10 },
  { id: 4, name: 'head oil', category: 'Personal Care', stock: 96, cost: 20, price: 25 },
  { id: 5, name: 'ponds', category: 'Beauty', stock: 97, cost: 10, price: 15 },
];

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-6m',
    name: 'SIX MONTH PLAN',
    price: 499,
    period: '/month',
    tagline: 'six month',
  },
  {
    id: 'plan-1m',
    name: 'MONTHLY PLAN',
    price: 99,
    period: '/month',
    tagline: 'this is one month plan',
  },
  {
    id: 'plan-3d',
    name: '3 DAYS PLAN',
    price: 2,
    period: '/month',
    tagline: 'three days plan',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start on Screen 4 (Dashboard) by default, but users can use the switcher or start at Screen 1
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('4-dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [workspaces, setWorkspacesState] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem('billmaster_workspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_WORKSPACES;
  });

  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(() => {
    try {
      const saved = localStorage.getItem('billmaster_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      }
    } catch {}
    return INITIAL_WORKSPACES[0];
  });

  const setWorkspaces = (newWorkspaces: Workspace[]) => {
    setWorkspacesState(newWorkspaces);
    try {
      localStorage.setItem('billmaster_workspaces', JSON.stringify(newWorkspaces));
    } catch {}
  };

  const setActiveWorkspace = (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    try {
      localStorage.setItem('billmaster_active_workspace', JSON.stringify(ws));
    } catch {}
  };

  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [plans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[2]); // 3 Days plan
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual'>('online');
  const [selectedBillForPreview, setSelectedBillForPreview] = useState<Bill | null>(null);
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('billmaster_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name) return parsed;
      }
    } catch {}
    return {
      name: 'Darshan Jadhav',
      email: 'dj460928@gmail.com',
      phone: '8668965024',
      role: 'OWNER',
      isVerified: true,
    };
  });

  const [subscription, setSubscription] = useState<ActiveSubscription>({
    planName: '3 DAYS PLAN',
    status: 'Active',
    startDate: '27 Oct 2026',
    expireDate: '30 Oct 2026',
    remainingDays: 53,
  });

  const addWorkspace = (ws: Omit<Workspace, 'id'>) => {
    const newWs: Workspace = {
      ...ws,
      id: `ws-${Date.now()}`,
    };
    setWorkspaces([newWs, ...workspaces]);
    setActiveWorkspace(newWs);
  };

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('billmaster_user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };


  const addBill = (billData: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...billData,
      id: `b-${Date.now()}`,
    };
    setBills((prev) => [newBill, ...prev]);
  };

  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const activateSubscription = (planName: string, days: number = 30) => {
    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + days);

    const formatDateStr = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    setSubscription({
      planName,
      status: 'Active',
      startDate: formatDateStr(today),
      expireDate: formatDateStr(expiry),
      remainingDays: days,
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        isDrawerOpen,
        setIsDrawerOpen,
        activeWorkspace,
        setActiveWorkspace,
        workspaces,
        setWorkspaces,
        addWorkspace,
        user,
        updateUser,
        bills,
        addBill,
        products,
        addProduct,
        plans,
        selectedPlan,
        setSelectedPlan,
        paymentMethod,
        setPaymentMethod,
        subscription,
        setSubscriptionData: setSubscription,
        activateSubscription,
        selectedBillForPreview,
        setSelectedBillForPreview,
        isCreateBillOpen,
        setIsCreateBillOpen,
        isAddProductOpen,
        setIsAddProductOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
