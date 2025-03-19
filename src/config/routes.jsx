import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/Home/HomePage';
import CreateRoomForm from '@/pages/Room/CreateRoomForm';
import RoomView from '@/pages/Room/RoomView';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import PageTransition from '@/shared/components/common/PageTransition';
import CalendarTest from '../pages/Calendar/CalendarTest';

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
      path: '/calendar-test',
      element: <CalendarTest />
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