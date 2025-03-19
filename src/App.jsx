import { RouterProvider } from 'react-router-dom';
import { RoomProvider } from './contexts/RoomContext';
import { router } from './config/routes.jsx';

function App() {
  return (
    <RoomProvider>
      <RouterProvider 
        router={router} 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      />
    </RoomProvider>
  );
}

export default App;