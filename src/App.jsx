import { RouterProvider } from 'react-router-dom';
import { RoomProvider } from './contexts/RoomContext';
import { router } from './config/routes';
import './styles/global.css';

function App() {
  return (
    <RoomProvider>
      <RouterProvider router={router} />
    </RoomProvider>
  );
}

export default App;