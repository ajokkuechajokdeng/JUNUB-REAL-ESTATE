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
          case 'search_by_type':
            const typeQuery = data.property_type ? `?property_type=${data.property_type}` : '';
            navigate(`/properties${typeQuery}`);
            break;
          case 'search_by_price':
            const priceQuery = data.min_price || data.max_price ? 
              `?${data.min_price ? `min_price=${data.min_price}` : ''}${data.min_price && data.max_price ? '&' : ''}${data.max_price ? `max_price=${data.max_price}` : ''}` : '';
            navigate(`/properties${priceQuery}`);
            break;
          case 'search_by_location':
            const locationQuery = data.location ? `?search=${encodeURIComponent(data.location)}` : '';
            navigate(`/properties${locationQuery}`);
            break;
          case 'search_by_bedrooms':
            const bedroomQuery = data.bedrooms ? `?bedrooms=${data.bedrooms}` : '';
            navigate(`/properties${bedroomQuery}`);
            break;
          case 'filter_properties':
            let filterQuery = '?';
            const filters = [];
            if (data.property_type) filters.push(`property_type=${data.property_type}`);
            if (data.min_price) filters.push(`min_price=${data.min_price}`);
            if (data.max_price) filters.push(`max_price=${data.max_price}`);
            if (data.bedrooms) filters.push(`bedrooms=${data.bedrooms}`);
            if (data.bathrooms) filters.push(`bathrooms=${data.bathrooms}`);
            if (data.search) filters.push(`search=${encodeURIComponent(data.search)}`);
            filterQuery += filters.join('&');
            navigate(`/properties${filterQuery}`);
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