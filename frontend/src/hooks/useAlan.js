import { useEffect, useRef } from 'react';
import alanBtn from '@alan-ai/alan-sdk-web';
import { useNavigate } from 'react-router-dom';

const useAlan = () => {
  const navigate = useNavigate();
  const alanInstance = useRef(null);

  useEffect(() => {
    alanInstance.current = alanBtn({
      key: 'df5167b2fbe12b401ca13987314095892e956eca572e1d8b807a3e2338fdd0dc/stage',
      onConnectionStatus: (status) => {
        console.log('Alan AI Status:', status);
      },
      onCommand: (commandData) => {
        const { command, data } = commandData;
        
        switch (command) {
          case 'navigate':
            navigate(data.route);
            break;
          case 'search_properties':
            navigate('/properties');
            break;
          case 'go_home':
            navigate('/');
            break;
          case 'login':
            navigate('/login');
            break;
          case 'register':
            navigate('/register');
            break;
          case 'dashboard':
            navigate('/dashboard');
            break;
          case 'profile':
            navigate('/profile');
            break;
          case 'my_rentals':
            navigate('/my-rentals');
            break;
          default:
            console.log('Unknown command:', command);
        }
      }
    });

    return () => {
      if (alanInstance.current) {
        alanInstance.current.remove();
      }
    };
  }, [navigate])
};

export default useAlan;