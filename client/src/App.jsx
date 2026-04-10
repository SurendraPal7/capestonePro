import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Products from './pages/Products';
import Earnings from './pages/Earnings';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Header />
                    <main className='py-3'>
                        <Routes>
                            <Route path='/' element={<Home />} />
                            <Route path='/login' element={<Login />} />
                            <Route path='/register' element={<Register />} />
                            <Route path='/dashboard' element={<Dashboard />} />
                            <Route path='/orders' element={<Orders />} />
                            <Route path='/marketplace' element={<Marketplace />} />
                            <Route path='/cart' element={<Cart />} />
                            <Route path='/products' element={<Products />} />
                            <Route path='/earnings' element={<Earnings />} />
                            <Route path='/analytics' element={<Analytics />} />
                            <Route path='/settings' element={<Settings />} />
                        </Routes>
                    </main>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
