import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ReplaceCartModal from './components/ReplaceCartModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Orders from './pages/Orders';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Products from './pages/Products';
import Earnings from './pages/Earnings';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <LocationProvider>
                        <Header />
                        <ReplaceCartModal />
                        <main className='py-3'>
                            <Routes>
                                <Route 
                                    path='/' 
                                    element={
                                        <ProtectedRoute restrictedRoles={['farmer']} redirectTo='/dashboard'>
                                            <Home />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route path='/login' element={<Login />} />
                                <Route path='/register' element={<Register />} />
                                <Route path='/dashboard' element={<Dashboard />} />
                                <Route 
                                    path='/admin' 
                                    element={
                                        <ProtectedRoute restrictedRoles={['farmer', 'buyer']} redirectTo='/dashboard'>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route path='/orders' element={<Orders />} />
                                <Route 
                                    path='/marketplace' 
                                    element={
                                        <ProtectedRoute restrictedRoles={['farmer']} redirectTo='/dashboard'>
                                            <Marketplace />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route 
                                    path='/cart' 
                                    element={
                                        <ProtectedRoute restrictedRoles={['farmer']} redirectTo='/dashboard'>
                                            <Cart />
                                        </ProtectedRoute>
                                    } 
                                />
                                <Route path='/products' element={<Products />} />
                                <Route path='/earnings' element={<Earnings />} />
                                <Route path='/analytics' element={<Analytics />} />
                                <Route path='/settings' element={<Settings />} />
                                <Route path='/profile' element={<Profile />} />
                            </Routes>
                        </main>
                    </LocationProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
