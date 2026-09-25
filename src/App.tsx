import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './apps/AppRoutes';

function App() {
  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000}/>    
      <AppRoutes />
    </div>
  );
}

export default App;
