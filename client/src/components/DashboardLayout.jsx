import { useContext } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AuthContext from '../context/AuthContext';
import '../pages/Dashboard.css';

const DashboardLayout = ({ children }) => {
    const { user } = useContext(AuthContext);
    const isFarmer = user?.role === 'farmer';

    return (
        <div className='dashboard-layout'>
            {isFarmer && <Sidebar />}
            <div className='main-content' style={{ marginLeft: isFarmer ? '250px' : '0' }}>
                {isFarmer && <Topbar />}
                <div className={isFarmer ? 'seller-dashboard-container' : 'container py-4'}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
