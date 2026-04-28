import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

/**
 * Hook to handle navigation based on entity type and ID
 */
export const useEntityNavigation = () => {
  const navigate = useNavigate();

  const navigateTo = (entityType, entityId, entityName = '') => {
    const routes = {
      consumer: `/consumers/details?id=${entityId}`,
      retailer: `/retailers/details?id=${entityId}`,
      rider: `/riders?id=${entityId}`,
      store: `/stores/details?id=${entityId}`,
      product: `/products?id=${entityId}`,
      order: `/orders?id=${entityId}`,
      payment: `/payments?id=${entityId}`,
      payout: `/payouts/retailers?id=${entityId}`,
      review: `/reviews/details?id=${entityId}`,
      category: `/categories?id=${entityId}`,
    };

    const route = routes[entityType];
    if (route) {
      navigate(route);
    }
  };

  return { navigateTo };
};

/**
 * Reusable component for clickable entity names
 * @param {string} name - Display name
 * @param {string} entityType - Type of entity (consumer, retailer, etc.)
 * @param {string} entityId - ID of the entity
 * @param {object} sx - Optional MUI sx props
 */
export const ClickableName = ({ name, entityType, entityId, sx = {} }) => {
  const { navigateTo } = useEntityNavigation();

  if (!name || !entityType || !entityId) {
    return <Typography>{name}</Typography>;
  }

  return (
    <Typography
      onClick={() => navigateTo(entityType, entityId, name)}
      sx={{
        cursor: 'pointer',
        color: '#1976d2',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          color: '#1565c0',
          textDecoration: 'underline',
          fontWeight: 600,
        },
        ...sx,
      }}
    >
      {name}
    </Typography>
  );
};

/**
 * Helper to format multiple clickable fields in a row
 */
export const formatEntityLink = (name, entityType, entityId) => {
  return { name, entityType, entityId };
};
