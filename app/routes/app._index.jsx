import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  DataTable,
  Icon,
  Link
} from "@shopify/polaris";
import { TickMinor, CancelMinor } from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const total = await db.customers.count();
  const errors = await db.customers.count({ where: { error: true } });
  const result = await db.customers.findMany({ where: { error: true } });

  const customers = result.map(i => {
    return JSON.parse(i.result);
  });

  return {
    customers,
    total,
    errors
  };
};

export default function Index() {

  const { customers = [], total = 0, errors = 0 } = useLoaderData();

  const rows = customers.map(customer => {
    return [
      <Link url={`shopify:admin/customers/${customer.reference}`} target="_blank">{customer.email || customer.reference}</Link>,
      customer.firstName ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.lastName ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.company ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.address1 ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.address2 ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.city ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.phone ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
      customer.zip ? <Icon source={TickMinor} tone="success" /> : <Icon source={CancelMinor} tone="critical" />,
    ]
  });

  return (
    <Page fullWidth title="Customer Address Validation">
      <BlockStack>
        <Layout>
          <Layout.Section>
            <Card>
              <Text as="h2" variant="bodyMd">
                Customers: {total}
              </Text>
              <Text as="h2" variant="bodyMd">
                With Errors: {errors}
              </Text>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card>
              <DataTable
                columnContentTypes={[
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text',
                  'text'
                ]}
                headings={[
                  'Email',
                  'First Name',
                  'Last Name',
                  'Company',
                  'Address 1',
                  'Address 2',
                  'City',
                  'Phone',
                  'Postal Code'
                ]}
                rows={rows}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
