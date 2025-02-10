import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/features/pages/Home/HomePage';
import CreateRoomForm from '@/features/room/CreateRoomForm';
import RoomView from '@/features/room/RoomView';
import NotFoundPage from '@/features/pages/NotFound';
import PageTransition from '@/shared/components/common/PageTransition';

const withPageTransition = (Component) => {
  return (
    <PageTransition>
      <Component />
    </PageTransition>
  );
};

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: withPageTransition(HomePage),
    },
    {
      path: '/create-room',
      element: withPageTransition(CreateRoomForm),
    },
    {
      path: '/room/:roomId',
      element: withPageTransition(RoomView),
    },
    {
      path: '*',
      element: withPageTransition(NotFoundPage)
    }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
); 