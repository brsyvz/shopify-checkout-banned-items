import React, { useState } from "react";

import {
  Banner,
  View,
  TextBlock,
  reactExtension,
  useBuyerJourneyIntercept,
  useBillingAddress,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.checkout.payment-method-list.render-after',
  () => <Extension />,
);
 
function Extension() {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const billingAddress = useBillingAddress();

  const rules = {
    firstName: {
      max_length_message: 'First Name should contain up to 20 characters only.',
      max_length: 20,
    },
    lastName: {
      max_length_message: 'First Name should contain up to 20 characters only.',
      max_length: 20,
    },
    company: {
      max_length_message: 'Company should contain up to 40 characters only.',
      max_length: 40,
    },
    address1: {
      max_length_message: 'Address 1 should contain up to 40 characters only.',
      max_length: 40,
    },
    address2: {
      max_length_message: 'Address 2 should contain up to 40 characters only.',
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
    if (canBlockProgress && billingAddress) {
      var isErrorOccured = false;

      // -- was blocking checkout --
      //  if (String(billingAddress.countryCode) == "US") {
      //    if (zipCodeValidation(String(billingAddress.countryCode), String(billingAddress.zip)) == false) {
      //       isErrorOccured = true;
      //       setShowError(true);
      //       setErrorMessage("The postal code is invalid.");
      //   }
      // }

      // -- was blocking checkout --
      // if (String(billingAddress.countryCode) !== "US") {
      //       isErrorOccured = true;
      //       setShowError(true);
      //       setErrorMessage("US addresses only.");
      // }

       if (String(billingAddress.countryCode) !== "US") {
            isErrorOccured = true;
            setShowError(true);
            setErrorMessage("US addresses only.");
      }

      Object.keys(rules).forEach(name => {
        if (billingAddress[name]) {
          let rule = rules[name];
          let value = billingAddress[name];
          if (value) {
            if (String(value).length > rule.max_length) {
              isErrorOccured = true;
              setShowError(true);
              setErrorMessage(rule.max_length_message);
            }
          }
        }
      });
    
      if (isErrorOccured) {
        return {
          behavior: 'block',
          reason: 'Billing address validation error',
        }
      }
    }

    setShowError(false);

    return {
      behavior: 'allow',
    };
  });

  return ( 
    <View visibility={showError == false ? 'hidden' : ''}>
      <Banner title="Please update the Billing address to continue." status='critical'>
        <TextBlock>
        {errorMessage}
        </TextBlock>
      </Banner>
    </View>
  );
}

// -- was blocking checkout --
// function zipCodeValidation(countryCode, zipCode) {
//   var usValidation = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
//   var isValid = false;
//   switch (countryCode) {
//       case "US":
//           isValid = usValidation.test(zipCode);
//           break;
//   }
//   return isValid;
// }
