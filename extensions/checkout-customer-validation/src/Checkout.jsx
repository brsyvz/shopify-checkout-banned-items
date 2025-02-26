import {
  useShippingAddress,
  useBuyerJourneyIntercept,
  reactExtension,
  View,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.delivery-address.render-before',
  () => <Extension />,
);

function Extension() {

  const shippingAddress = useShippingAddress();

  const rules = {
    firstName: {
      max_length_message: 'First name cannot exceed 20 characters.',
      max_length: 20,
    },
    lastName: {
      max_length_message: 'Last name cannot exceed 20 characters.',
      max_length: 20,
    },
    company: {
      max_length_message: 'Company cannot exceed 40 characters..',
      max_length: 40,
    },
    address1: {
      max_length_message: 'Address 1 cannot exceed 40 characters.',
      max_length: 40,
    },
    address2: {
      max_length_message: 'Address 2 cannot exceed 40 characters.',
      max_length: 40,
    },
    city: {
      max_length_message: 'City should contain up to 40 characters only.',
      max_length: 40,
    },
    phone: {
      max_length_message: 'Phone should contain up to 30 characters only.',
      max_length: 30,
    }
  }
  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress) {
      let errors = [];

      if (String(shippingAddress.countryCode) == "US") {
        if (zipCodeValidation(String(shippingAddress.countryCode), String(shippingAddress.zip)) == false) {
            errors = [...errors, {
              message: "The postal code is invalid.",
              target: `$.cart.deliveryGroups[0].deliveryAddress.zip`
            }];
        }
      }

    if(String(shippingAddress.countryCode) !== "US") {
        return {
          behavior: "block",
          reason: 'Shipping address validation error',
          errors: [
            {
              message: "US addresses only.",
              target: `$.cart.deliveryGroups[0].deliveryAddress.countryCode`
            },
           
          ],
        };
      }

      Object.keys(rules).forEach(name => {
        if (shippingAddress[name]) {
          let rule = rules[name];
          let value = shippingAddress[name];
          if (value) {
            if (String(value).length > rule.max_length) {
              errors = [...errors, {
                message: rule.max_length_message,
                target: `$.cart.deliveryGroups[0].deliveryAddress.${name}`
              }];
            }
          }
        }
      });
   
      if (errors.length) {
        return {
          behavior: 'block',
          reason: 'Shipping address validation error',
          // errors: [...errors, { message: 'Please update the Shipping address to continue.' }]
        }
      }
    }

    return {
      behavior: 'allow'
    };
  });

  return (
    <View visibility='false'></View>
  );
}

function zipCodeValidation(countryCode, zipCode) {
  var usValidation = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
  var isValid = false;
  switch (countryCode) {
      case "US":
          isValid = usValidation.test(zipCode);
          break;
  }
  return isValid;
}
