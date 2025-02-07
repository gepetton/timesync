import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/features/pages/Home/HomePage';
import CreateRoomForm from '@/features/room/CreateRoomForm';
import RoomView from '@/features/room/RoomView';
import NotFoundPage from '@/features/pages/NotFound';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/create-room',
      element: <CreateRoomForm />,
    },
    {
      path: '/room/:roomId',
      element: <RoomView />,
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
); 