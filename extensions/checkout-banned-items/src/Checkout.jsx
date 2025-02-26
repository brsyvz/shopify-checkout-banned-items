import React, { useEffect } from 'react';
import {
  reactExtension,
  View,
  SkeletonText,
  useTarget,
  useApi,
  useShippingAddress,
  useBuyerJourneyIntercept,
  Text
} from '@shopify/ui-extensions-react/checkout';
import { GetCountryByCode } from './modules/CountryHelper.js';

export default reactExtension(
  'purchase.checkout.cart-line-item.render-after',
  () => <Extension />,
);

function Extension() {

  const [visibility, setVisibility] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [countries, setCountries] = React.useState([]);
  const [isBanned, setIsBanned] = React.useState(false);
  const shippingAddress = useShippingAddress();

  const { query } = useApi();
  const { merchandise } = useTarget();

  const getBannedCountryCodes = (items) => {
    return items.filter(item => {
      return item.includes('banned-');
    }).map(item => {
      return String(item.replace('banned-', '')).toUpperCase();
    }).map(item => {
      return GetCountryByCode(item);
    })
  };

  const getProductTag = (id) => {
    return new Promise((resolve, reject) => {
      return query(
        `query {
          product (id: "${id}") {
            tags
          }
        }`
      ).then(response => {
        return resolve(getBannedCountryCodes(response.data.product.tags));
      }).catch(err => {
        return reject(err);
      })
    });
  }

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress && shippingAddress) {
      if (shippingAddress.countryCode) {
        let isBanned = countries.find(country => {
          return String(country?.code).toLocaleLowerCase() === String(shippingAddress.countryCode).toLocaleLowerCase();
        });
        if (isBanned) {
          setVisibility(true);
          setIsBanned(true);
          
          let result = {
            behavior: 'block',
            reason: `${merchandise.title} is not permitted in your country.`,
          };
          // errors: [{ message: `${merchandise.title} is not permitted in your country.` }]
          return result; 
        }
      }
    }

    return {
      behavior: 'allow'
    };
  });

  useEffect(() => {
    setLoading(true);
    setVisibility(true);
    getProductTag(merchandise.product.id).then(result => {
      setLoading(false);
      setVisibility(false);
      setCountries(result);
    });
  }, [])

  return <View visibility={visibility ? '' : 'hidden'} display='block' padding={['none', 'none']}>
    {loading && <SkeletonText />}
    {
      (!loading && isBanned) &&
      <Text appearance='critical' emphasis='bold' size='small'>This item is not permitted in your country.</Text>
    }
  </View>;
}
