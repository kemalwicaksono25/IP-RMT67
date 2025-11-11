import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import RootLayout from './routes/RootLayout';
import Protected from './routes/Protected';
import Login from './routes/auth/Login';
import Register from './routes/auth/Register';
import Dashboard from './routes/dashboard/Dashboard';
import ProductList from './routes/products/ProductList';
import ProductDetail from './routes/products/ProductDetail';
import ProductForm from './routes/products/ProductForm';
import BriefNew from './routes/briefs/BriefNew';
import BriefDetail from './routes/briefs/BriefDetail';
import BriefReview from './routes/briefs/BriefReview';
import CalendarView from './routes/calendar/CalendarView';
import Team from './routes/settings/Team';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Protected>
                <RootLayout />
              </Protected>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            <Route path="briefs/new" element={<BriefNew />} />
            <Route path="briefs/:id" element={<BriefDetail />} />
            <Route
              path="admin/approvals"
              element={
                <Protected roles={['admin']}>
                  <BriefReview />
                </Protected>
              }
            />
            <Route path="calendar" element={<CalendarView />} />
            <Route
              path="settings/team"
              element={
                <Protected roles={['admin']}>
                  <Team />
                </Protected>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}

export default App;
