import dotenv from 'dotenv';
import moment from 'moment';
import { unauthenticated } from "../shopify.server";
import db from "../db.server";

dotenv.config();

const LengthValidator = (value, length) => {
  if (!value) {
    /** ignore empty fields */
    return true;
  }
  if (String(value).length <= length) {
    return true;
  }
  return false;
};

export const Rules = {
  firstName: {
    max_length: 20,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.firstName.max_length);
    }
  },
  lastName: {
    max_length: 20,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.lastName.max_length);
    }
  },
  company: {
    max_length: 40,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.company.max_length);
    }
  },
  address1: {
    max_length: 40,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.address1.max_length);
    }
  },
  address2: {
    max_length: 40,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.address2.max_length);
    }
  },
  city: {
    max_length: 40,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.city.max_length);
    }
  },
  phone: {
    max_length: 30,
    validate: (val) => {
      return LengthValidator(val.trim(), Rules.phone.max_length);
    }
  },
  zip: {
    validate: (countryCode, zipCode) => {
      var usValidation = new RegExp(/(^\d{5}$)|(^\d{5}-\d{4}$)/);
      var caValidation = new RegExp(/^[ABCEGHJ-NPRSTVXY][0-9][ABCEGHJ-NPRSTV-Z] [0-9][ABCEGHJ-NPRSTV-Z][0-9]$/);
      var isValid = false;
      switch (countryCode) {
        case "US":
          isValid = usValidation.test(zipCode);
          break;
        case "CA":
          isValid = caValidation.test(zipCode);
          break;
      }
      return isValid;
    }
  }
}

class Customers {

  constructor(shop) {
    this.shop = shop;
  }

  async start() {

    const { admin } = await unauthenticated.admin(this.shop);

    let total = 0;
    let lastInfo = {};

    let pastYear = moment().subtract(1, 'year').toISOString();

    do {
      const after = lastInfo.hasNextPage ? `after: "${lastInfo.endCursor}"` : `after: null`;
      const response = await admin.graphql(
        `#graphql
          query {
            customers(first: 250, query: "order_date:>='${pastYear}'", ${after}) {
              edges {
                node {
                id
                email
                legacyResourceId
                addresses {
                  firstName
                  lastName
                  company
                  address1
                  address2
                  city
                  phone
                  zip
                  countryCodeV2
                }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `
      );

      const responseJson = await response.json();
      const items = responseJson.data.customers.edges || [];

      lastInfo = responseJson.data.customers.pageInfo || {};
      total += items.length

      console.log(`${new Date().toLocaleString()} - Total Fetch Items: ${total}`);

      await Promise.all(items.map(async (customer) => {

        let firstName = customer.node.addresses.map(address => {
          return Rules.firstName.validate(address.firstName || '');
        });
        let lastName = customer.node.addresses.map(address => {
          return Rules.lastName.validate(address.lastName || '');
        });
        let company = customer.node.addresses.map(address => {
          return Rules.company.validate(address.company || '');
        });
        let address1 = customer.node.addresses.map(address => {
          return Rules.address1.validate(address.address1 || '');
        });
        let address2 = customer.node.addresses.map(address => {
          return Rules.address2.validate(address.address2 || '');
        });
        let city = customer.node.addresses.map(address => {
          return Rules.city.validate(address.city || '');
        });
        let phone = customer.node.addresses.map(address => {
          return Rules.phone.validate(address.phone || '');
        });
        let zip = customer.node.addresses.map(address => {
          return Rules.zip.validate(address.countryCodeV2, address.zip);
        });

        let result = {
          id: customer.node.id,
          email: customer.node.email,
          reference: customer.node.legacyResourceId,
          firstName: !firstName.some(d => d === false),
          lastName: !lastName.some(d => d === false),
          company: !company.some(d => d === false),
          address1: !address1.some(d => d === false),
          address2: !address2.some(d => d === false),
          city: !city.some(d => d === false),
          phone: !phone.some(d => d === false),
          zip: !zip.some(d => d === false),
        }

        if (Object.values(result).some(v => v === false)) {
          result.has_error = true;
        } else {
          result.has_error = false;
        }

        return await db.customers.upsert({
          where: {
            id: customer.node.id
          },
          update: {
            email: customer.node.email || '',
            resource: customer.node.legacyResourceId,
            addresses: JSON.stringify(customer.node.addresses),
            result: JSON.stringify(result),
            error: result.has_error
          },
          create: {
            id: customer.node.id,
            email: customer.node.email || '',
            resource: customer.node.legacyResourceId,
            addresses: JSON.stringify(customer.node.addresses),
            result: JSON.stringify(result),
            error: result.has_error
          }
        })
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

    } while (lastInfo?.hasNextPage === true);
  }
}

const params = process.argv.slice(2);
const [shopUrl] = params;

const app = new Customers(shopUrl);
app.start();