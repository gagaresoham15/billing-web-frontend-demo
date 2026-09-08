import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SignInPassword } from './features/auth/SignInPassword';
import { SignInOtp } from './features/auth/SignInOtp';
import { SelectBusiness } from './features/auth/SelectBusiness';
import { SignUp } from './features/auth/SignUp';
import { DashboardHome } from './features/dashboard/DashboardHome';
import { SideDrawer } from './features/navigation/SideDrawer';
import { SalesInvoices } from './features/invoices/SalesInvoices';
import { ProductsInventory } from './features/products/ProductsInventory';
import { ReportsAnalytics } from './features/reports/ReportsAnalytics';
import { AccountProfile } from './features/profile/AccountProfile';
import { ChoosePlan } from './features/subscriptions/ChoosePlan';
import { PaymentMethod } from './features/subscriptions/PaymentMethod';
import { RazorpayModal } from './features/subscriptions/RazorpayModal';
import { ManualQrPayment } from './features/subscriptions/ManualQrPayment';
import { SubscriptionStatus } from './features/subscriptions/SubscriptionStatus';
import { CreateBill } from './features/invoices/CreateBill';
import { CategoriesView } from './features/products/CategoriesView';
import { CustomersView } from './features/customers/CustomersView';
import { ExpensesView } from './features/reports/ExpensesView';
import { DashboardLayout } from './layouts/DashboardLayout';
import './App.css';

const AppContent: React.FC = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case '1-signin-password':
        return <SignInPassword />;
      case '2-signin-otp':
        return <SignInOtp />;
      case 'signup':
        return <SignUp />;
      case '3-select-business':
        return <SelectBusiness />;
      case '5-side-drawer':
        return <SideDrawer isOverlay={false} />;
      case '12-razorpay-popup':
        return <RazorpayModal />;
      case '4-dashboard':
        return (
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        );
      case 'create-bill':
        return (
          <DashboardLayout>
            <CreateBill />
          </DashboardLayout>
        );
      case '6-sales-invoices':
        return (
          <DashboardLayout>
            <SalesInvoices />
          </DashboardLayout>
        );
      case '7-products':
        return (
          <DashboardLayout>
            <ProductsInventory />
          </DashboardLayout>
        );
      case 'categories':
        return (
          <DashboardLayout>
            <CategoriesView />
          </DashboardLayout>
        );
      case 'customers':
        return (
          <DashboardLayout>
            <CustomersView />
          </DashboardLayout>
        );
      case 'expenses':
        return (
          <DashboardLayout>
            <ExpensesView />
          </DashboardLayout>
        );
      case '8-reports':
        return (
          <DashboardLayout>
            <ReportsAnalytics />
          </DashboardLayout>
        );

      case '9-profile':
        return (
          <DashboardLayout>
            <AccountProfile />
          </DashboardLayout>
        );
      case '10-choose-plan':
        return (
          <DashboardLayout>
            <ChoosePlan />
          </DashboardLayout>
        );
      case '11-payment-method':
        return (
          <DashboardLayout>
            <PaymentMethod />
          </DashboardLayout>
        );
      case '13-manual-qr':
        return (
          <DashboardLayout>
            <ManualQrPayment />
          </DashboardLayout>
        );
      case '14-subscription-status':
        return (
          <DashboardLayout>
            <SubscriptionStatus />
          </DashboardLayout>
        );
      default:
        return (
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', maxWidth: '100%', overflow: 'hidden' }}>
      {/* Active Screen View */}
      <div style={{ flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>{renderScreen()}</div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
