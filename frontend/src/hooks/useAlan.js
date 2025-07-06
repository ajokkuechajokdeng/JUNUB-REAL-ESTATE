import { useEffect, useRef } from 'react';
import alanBtn from '@alan-ai/alan-sdk-web';
import { useNavigate } from 'react-router-dom';

const alanKey = 'df5167b2fbe12b401ca13987314095892e956eca572e1d8b807a3e2338fdd0dc/stage'; // Replace with your Alan Studio key

const useAlan = (onFilterCommand) => {
  const navigate = useNavigate();
  const alanInstance = useRef(null);

  useEffect(() => {
    alanInstance.current = alanBtn({
      key: alanKey,
      onCommand: (commandData) => {
        const { command, data } = commandData;

        // Home page filter commands
        if (
          command === 'filter_properties' ||
          command === 'clear_filters' ||
          command === 'submit_search'
        ) {
          if (typeof onFilterCommand === 'function') {
            onFilterCommand(command, data);
            return;
          }
        }

        // Navigation and other commands
        switch (command) {
          case 'navigate':
            navigate(data.route);
            break;
          case 'search_properties':
            navigate('/properties');
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
            // Unknown command
        }
      }
    });

    return () => {
      try {
        if (alanInstance.current && typeof alanInstance.current.remove === 'function') {
          alanInstance.current.remove();
        }
      } catch (e) {
        // Suppress Alan SDK internal errors on cleanup
      }
      alanInstance.current = null;
    };
  }, [navigate, onFilterCommand]);
};

export default useAlan;