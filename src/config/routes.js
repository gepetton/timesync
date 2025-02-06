import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/Home';
import RoomPage from '../pages/Room';
import NotFoundPage from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/room/:roomId',
    element: <RoomPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]); 