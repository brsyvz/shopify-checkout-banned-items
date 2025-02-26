import React, { useEffect } from 'react';
import {
  reactExtension,
  useApi,
  useShippingAddress,
  useBuyerJourneyIntercept,
  useCartLines,
  useApplyCartLinesChange,
  Banner,
  TextBlock,
  List,
  ListItem,
  BlockSpacer,
  View,
  Button,
  Spinner,
  Text,
  Link
} from '@shopify/ui-extensions-react/checkout';
import { PromiseMap } from './modules/ArrayHelper.js';
import { GetCountryByCode } from './modules/CountryHelper.js';

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {

  const [removeLoading, setRemoveLoading] = React.useState(false);
  const [bannedItems, setBanneditems] = React.useState([]);
  const [invalidItems, setInvalidItems] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [country, setCountry] = React.useState({ code: '', name: '' });

  const items = useCartLines();
  const shippingAddress = useShippingAddress();
  const applyCartLinesChange = useApplyCartLinesChange();

  const { query } = useApi();

  const getBannedCountryCodes = (items) => {
    return items.filter(item => {
      return item.includes('banned-');
    }).map(item => {
      return String(item.replace('banned-', '')).toUpperCase();
    }).map(item => {
      return GetCountryByCode(item);
    })
  };

  const getProductWithCountryCode = (item) => {
    return new Promise((resolve, reject) => {
      return query(
        `query {
          product (id: "${item?.merchandise?.product?.id}") {
            tags
          }
        }`
      ).then(response => {
        let codes = getBannedCountryCodes(response.data.product.tags);
        return resolve({ item, codes });
      }).catch(err => {
        return reject(err);
      })
    });
  }

  useBuyerJourneyIntercept(({ canBlockProgress }) => {

    if (canBlockProgress && shippingAddress) {
      if (shippingAddress.countryCode) {

        let findInvalids = products.filter(product => {
          let invalid = product.codes.some(country => {
            return !country?.code;
          });
          return invalid ? product : false;
        });

        if (findInvalids.length) {
          setInvalidItems(findInvalids);
          return {
            behavior: 'block',
            reason: 'There are certain items that contains invalid country code.'
          }
        }

        setBanneditems(products.filter(product => {
          return product.codes.find(country => {
            return String(country?.code).toLowerCase() === String(shippingAddress.countryCode).toLowerCase();
          });
        }));

        if (bannedItems.length) {
          return {
            behavior: 'block',
            reason: 'There are certain items that are not allowed in your country.'
          }
        }
      }
    }

    return {
      behavior: 'allow'
    };
  });

  const RemoveItems = React.useCallback(() => {
    setRemoveLoading(true);
    PromiseMap(bannedItems, (line) => {
      return applyCartLinesChange({
        type: 'removeCartLine',
        id: line.item.id,
        quantity: line.item.quantity
      })
    }, { concurrency: 1 }).then((res) => {
      setBanneditems([]);
      setRemoveLoading(false);
    });
  }, [bannedItems]);

  useEffect(() => {
    Promise.all(items.map(item => {
      return getProductWithCountryCode(item);
    })).then(result => {
      setCountry(GetCountryByCode(shippingAddress.countryCode));
      setProducts(result);
    });
  }, [bannedItems]);

  return (
    <>
      <View visibility={bannedItems.length === 0 ? 'hidden' : ''}>
        <Banner title='Whoops, review your cart!' status='critical'>
          <TextBlock>
            Your cart contains items that cannot be shipped to {country.name}.
            Would you like us to remove these items so you can continue checkout?
          </TextBlock>
          <BlockSpacer />
          {
            bannedItems.length &&
            <List>
              {
                bannedItems.map((line) => (
                  <ListItem key={line?.item?.merchandise?.product.id}>{line?.item?.merchandise?.title}</ListItem>
                ))
              }
            </List>
          }
          <BlockSpacer />
          {
            !removeLoading ? <Button appearance='monochrome' kind='secondary' onPress={RemoveItems}>Remove Items</Button> : <Spinner />
          }
        </Banner>
      </View>
      <View visibility={invalidItems.length === 0 ? 'hidden' : ''}>
        <Banner title='Whoops, review your cart!' status='warning'>
          <TextBlock>
            We regret to inform you that we are currently unable to proceed with
            shipping due to an issue with the following products:
          </TextBlock>
          <BlockSpacer />
          {
            invalidItems.length &&
            <List>
              {
                invalidItems.map((line) => (
                  <ListItem key={line?.item?.merchandise?.product.id}>{line?.item?.merchandise?.title}</ListItem>
                ))
              }
            </List>
          }
          <BlockSpacer />
          <Text>
            For assistance, please contact our support team at <Text emphasis>info@.com</Text>.
          </Text>
        </Banner>
      </View>
    </>
  );
}
