import { join } from 'path';
import { writeFile } from 'fs';
import { IEzManageOrder } from 'src/external-modules/ezmanage-api/interfaces/gql/responses';
import {
  InvoiceFlowInvoiceBill,
  InvoiceFlowInvoiceData,
  InvoiceFlowInvoiceItem,
} from 'src/external-modules/invoiceflow/generate-invoice.type';

export function createInvoiceTemplate(
  order: IEzManageOrder,
): InvoiceFlowInvoiceData {
  /**
   * Needs:
   * Order Number: order.orderNumber
   * Order Date: order.event - suipposed to be delivery date or bought date?
   * Person/Company/Contact info placing the order - event.contact[name] or ordercustomer[firstName, lastName]
   * Items + Qty + Prices - catererCart.orderItems[i]{name, quantity, totalInSubunits: subunits} (that's in cents)
   * Subtotal total.subTotal.subunits (in cents)
   * Tax - totals.salesTax.subunits (in cents)
   * Delivery catererCart.feesAndDiscounts.find(fee | fee.name === 'Delivery Fee').cost.subunits (in cents)
   * Anything else
   * Total: total.customerTotalDue.subunits (in cents)
   */
  // const invoiceItems = buildInvoiceItemsForCsv(order);

  // const invoicesDir = join(__dirname, '..', '..', '..', 'utility', 'invoices');
  // const fileName = `${order.orderNumber}-invoice-helper.csv`;
  // const filePath = join(invoicesDir, fileName);

  // const header = 'Item,Quantity,Price\n';
  // const rows = invoiceItems.map((item) => {
  //   const quantity = item.quantity === 0 ? '' : item.quantity;
  //   return `${item.item},${quantity},${item.price}`;
  // });
  // const content = header + rows.join('\n');

  // writeFile(filePath, content, (err) => {
  //   if (err) {
  //     console.error('Error creating CSV file:', err);
  //   } else {
  //     console.log(`CSV file created successfully at ${filePath}`);
  //   }
  // });
  const invoiceData = buildInvoiceData(order);
  return invoiceData;
}

type CsvInput = InvoiceItem[];

function buildInvoiceData(order: IEzManageOrder): InvoiceFlowInvoiceData {
  const {
    name: customer_name,
    address: customer_address,
    phone: customer_contact,
  } = buildContact(order);

  const { company_address_str, company_address_city_st_zip } =
    getAddressObject(order);

  const { subtotal, tax, deliveryFee, tip, otherBilling, total } =
    buildBilling(order);
  // const subtotal = billing.find((bill) => bill.name === 'Subtotal');
  // const tax = billing.find((bill) => bill.name === 'Tax');
  // const delivery = billing.find((bill) => bill.name === 'Delivery fee');
  // const tip = billing.find((bill) => bill.name === 'Tip');
  // const total = getTotal(order);

  const MISSING_PRICE = '$0.00';

  const extras: InvoiceFlowInvoiceItem[] = [
    {
      name: 'Subtotal',
      description: '',
      quantity: 0,
      amount: 0,
      price: subtotal,
    },
    {
      name: 'Tax',
      description: '',
      quantity: 0,
      amount: 0,
      price: tax,
    },
    // {
    //   name: 'Delivery Fee',
    //   description: '',
    //   quantity: 0,
    //   amount: 0,
    //   price: deliveryFee || MISSING_PRICE,
    // },
    {
      name: 'Tip',
      description: '',
      quantity: 0,
      amount: 0,
      price: tip || MISSING_PRICE,
    },
    // {
    //   name: 'Discounts, Fees, Etc',
    //   description: '',
    //   quantity: 0,
    //   amount: 0,
    //   price: MISSING_PRICE,
    // },
    ...(otherBilling || []).map(({ name, price }) => ({
      name,
      description: '',
      quantity: 0,
      amount: 0,
      price,
    })),
    {
      name: 'Total',
      description: '',
      quantity: 0,
      amount: 0,
      price: total,
    },
  ];

  const invoiceData: InvoiceFlowInvoiceData = {
    company_name: `Honey Baked Ham, ${order.caterer.address.city} GA`,
    company_address: getAddress(order),
    company_contact: 'Brooke Colter, Regional Sales Director (706)614-5590',
    company_logo: '',
    customer_name,
    customer_address,
    customer_contact,
    invoice_number: order.orderNumber,
    invoice_date: formatDate(new Date()),
    payment_terms: 'INSERT PAYMENT TERMS',
    // invoice_items: buildItemsForInvoiceFlow(order),
    invoice_items: buildItemsForInvoiceflow2(order, extras),
    invoice_bills: buildBillingForInvoiceflow(order),
    total_amount: 0,
    notes: '',
    customer_company: '',
    order_date: getOrderDate(order),
    due_date: '',
    subtotal: subtotal || MISSING_PRICE,
    tax: tax || MISSING_PRICE,
    delivery_fee: deliveryFee || MISSING_PRICE,
    tip: tip || MISSING_PRICE,
    discounts_fees: MISSING_PRICE,
    total: total || MISSING_PRICE,
    company_address_str,
    company_address_city_st_zip,
    company_phone: getPhone(order),
  };
  return invoiceData;
}

// function buildInvoiceItemsForCsv(order: IEzManageOrder): CsvInput {
//   const { orderNumber, event, orderCustomer, totals, caterer, catererCart } =
//     order;

//   const date = convertDate(event.timestamp, event.timeZoneOffset);
//   const contact = buildContact(order);
//   const items = buildItemsForCSV(order);
//   const billing = buildBilling(order);

//   const output: CsvInput = [
//     { item: 'Order number', quantity: 0, price: orderNumber },
//     { item: 'Date', quantity: 0, price: date },
//     { item: 'Contact', quantity: 0, price: contact },
//     ...items,
//     { item: 'BILLING', quantity: 0, price: '' },
//     { item: 'Subtotal', quantity: 0, price: billing.subtotal },
//     { item: 'Tax', quantity: 0, price: billing.tax },
//   ];

//   if (billing.deliveryFee) {
//     output.push({
//       item: 'Delivery fee',
//       quantity: 0,
//       price: billing.deliveryFee,
//     });
//   }

//   if (billing.tip) {
//     output.push({
//       item: 'Tip',
//       quantity: 0,
//       price: billing.tip,
//     });
//   }

//   return output;
// }
function formatDate(date: Date): string {
  // Format the date
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
  const year = date.getFullYear().toString().slice(2, 4); // Get last two digits of year

  return `${month}/${day}/${year}`;
}

function getOrderDate(order: IEzManageOrder): string {
  return convertDate(order.event.timestamp, order.event.timeZoneOffset);
}

function convertDate(timestamp: string, timeZoneOffset: string): string {
  // Parse the timestamp and offset
  const date = new Date(timestamp);
  const offsetHours = parseInt(timeZoneOffset.slice(1, 3));
  const offsetMinutes = parseInt(timeZoneOffset.slice(4, 6));

  // Apply the offset
  if (timeZoneOffset[0] === '-') {
    date.setHours(date.getHours() - offsetHours);
    date.setMinutes(date.getMinutes() - offsetMinutes);
  } else {
    date.setHours(date.getHours() + offsetHours);
    date.setMinutes(date.getMinutes() + offsetMinutes);
  }

  // Format the date
  return formatDate(date);
}

function buildContact(order: IEzManageOrder): {
  name: string;
  address: string;
  phone: string;
} {
  const { event, orderCustomer } = order;

  let name = 'Name not provided';
  if (orderCustomer && orderCustomer.firstName && orderCustomer.lastName) {
    name = `${orderCustomer.firstName} ${orderCustomer.lastName}`;
  } else if (event && event.contact && event.contact.name) {
    name = event.contact.name;
  }

  let address = 'Address not provided';
  if (event.address) {
    const { street, street2, street3, city, state, zip } = event.address;
    address = `${street || ''}${street2 ? `, ${street2}` : ''}${
      street3 ? `, ${street3}` : ''
    }${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}${
      zip ? `, ${zip}` : ''
    }`;
  }

  let phone = 'Phone not provided';
  if (event.contact && event.contact.phone) {
    phone = event.contact.phone;
  }
  return { name, address, phone };
}

type InvoiceItem = {
  item: string;
  quantity: number;
  price: string; // String in form $DD.CC
};
function buildItemsForCSV(order: IEzManageOrder): InvoiceItem[] {
  if (
    !(
      order.catererCart &&
      Array.isArray(order.catererCart.orderItems) &&
      order.catererCart.orderItems.length > 0
    )
  ) {
    return [];
  }

  /**
   * Items + Qty + Prices - catererCart.orderItems[i]{name, quantity, totalInSubunits: subunits} (that's in cents)
   */

  return order.catererCart.orderItems.map((cartItem) => ({
    item: cartItem.name,
    quantity: cartItem.quantity,
    price: formatPrice(cartItem.totalInSubunits.subunits),
  }));
}

function buildItemsForInvoiceflow2(
  order: IEzManageOrder,
  extras: InvoiceFlowInvoiceItem[],
): InvoiceFlowInvoiceItem[] {
  if (
    !(
      order.catererCart &&
      Array.isArray(order.catererCart.orderItems) &&
      order.catererCart.orderItems.length > 0
    )
  ) {
    return [];
  }

  const items = order.catererCart.orderItems.map((cartItem) => {
    const price = formatPriceForInvoiceFlow(cartItem.totalInSubunits.subunits);
    return {
      name: cartItem.name,
      description: 'A beautiful sandwich',
      quantity: cartItem.quantity,
      amount: price,
      price:
        cartItem.totalInSubunits.subunits === 0
          ? '$0.00'
          : formatPrice(cartItem.totalInSubunits.subunits),
    };
  });

  return [
    ...items,
    { name: '', description: '', quantity: 0, amount: 0, price: '' },
    ...extras,
  ];
}

function buildItemsForInvoiceFlow(
  order: IEzManageOrder,
): InvoiceFlowInvoiceItem[] {
  if (
    !(
      order.catererCart &&
      Array.isArray(order.catererCart.orderItems) &&
      order.catererCart.orderItems.length > 0
    )
  ) {
    return [];
  }

  return order.catererCart.orderItems.map((cartItem) => {
    const price = formatPriceForInvoiceFlow(cartItem.totalInSubunits.subunits);
    return {
      name: cartItem.name,
      description: 'A beautiful sandwich',
      quantity: cartItem.quantity,
      amount: price,
      price: formatPrice(cartItem.totalInSubunits.subunits),
    };
  });
}

function formatPrice(cents: number) {
  if (cents === 0) {
    return '$0.00';
  }

  const absoluteCents = Math.abs(cents);
  const centsStr = absoluteCents.toString();
  const dollars = centsStr.slice(0, -2);
  const centsOnly = centsStr.slice(-2);
  const absoluteAmount = `$${dollars}.${centsOnly}`;

  return cents > 0 ? `${absoluteAmount}` : `-${absoluteAmount}`;
}

function formatPriceForInvoiceFlow(cents: number): number {
  const centsStr = cents.toString();
  const dollars = centsStr.slice(0, -2);
  const centsOnly = centsStr.slice(-2);
  const price = parseFloat(dollars + '.' + centsOnly);
  return price;
}

/**
 * Subtotal total.subTotal.subunits (in cents)
 * Tax - totals.salesTax.subunits (in cents)
 * Delivery catererCart.feesAndDiscounts.find(fee | fee.name === 'Delivery Fee').cost.subunits (in cents)
 * Anything else
 * Total: total.customerTotalDue.subunits (in cents)
 */
type InvoiceBilling = {
  subtotal: string;
  tax: string;
  total: string;
  deliveryFee?: string | null;
  tip?: string | null;
  discounts_fees?: string | null;
  otherBilling?: {
    name: string;
    price: string;
  }[];
};

function buildBilling(order: IEzManageOrder) {
  const { totals, catererCart } = order;

  const retObj: InvoiceBilling = {
    subtotal: formatPrice(totals.subTotal.subunits),
    tax:
      totals.salesTax.subunits === 0
        ? '$0.00'
        : formatPrice(totals.salesTax.subunits),
    // total: formatPrice(getTotal(order)),
    /**
     * Apparently the wrong way to get total due
     */
    // total: `$${order.catererCart.totals.catererTotalDue.toString()}`,
    total: `${formatPrice(totals.customerTotalDue.subunits)}`,
  };

  const deliveryFeeRecord = catererCart.feesAndDiscounts.find(
    (fee) => fee.name === 'Delivery Fee',
  );
  const deliveryFee = deliveryFeeRecord
    ? formatPrice(deliveryFeeRecord.cost.subunits)
    : undefined;

  const tip =
    totals.tip.subunits > 0 ? formatPrice(totals.tip.subunits) : undefined;

  // let discounts = 0;
  // if (Array.isArray(catererCart.feesAndDiscounts)) {
  //   for (const fod of catererCart.feesAndDiscounts) {
  //     if (fod.cost.subunits < 0) {
  //       discounts += fod.cost.subunits;
  //     }
  //   }
  // }
  // console.log('discounts', discounts);

  // This could be how InvoiceBilling sections could be handled. "Other Billing"
  if (catererCart.feesAndDiscounts.length > 0) {
    retObj.otherBilling = catererCart.feesAndDiscounts.map((fd) => ({
      name: fd.name,
      price: formatPrice(fd.cost.subunits),
    }));
  }

  if (deliveryFee) retObj.deliveryFee = deliveryFee;
  if (tip) retObj.tip = tip;
  return retObj;
}

function buildBillingForInvoiceflow(
  order: IEzManageOrder,
): InvoiceFlowInvoiceBill[] {
  const { totals, catererCart } = order;

  const billItems: InvoiceFlowInvoiceBill[] = [
    {
      name: 'Subtotal',
      value: formatPriceForInvoiceFlow(totals.subTotal.subunits),
    },
    {
      name: 'Tax',
      value: formatPriceForInvoiceFlow(totals.salesTax.subunits),
    },
  ];

  const deliveryFeeRecord = catererCart.feesAndDiscounts.find(
    (fee) => fee.name === 'Delivery Fee',
  );
  const deliveryFee = deliveryFeeRecord
    ? formatPriceForInvoiceFlow(deliveryFeeRecord.cost.subunits)
    : undefined;

  const tip =
    totals.tip.subunits > 0
      ? formatPriceForInvoiceFlow(totals.tip.subunits)
      : undefined;

  if (deliveryFee) {
    billItems.push({ name: 'Delivery fee', value: deliveryFee });
  }
  if (tip) {
    billItems.push({ name: 'Tip', value: tip });
  }
  return billItems;
}

function getTotal(order: IEzManageOrder): number {
  console.log('butts');
  return order.catererCart.totals.catererTotalDue;
}

function getAddress(order: IEzManageOrder): string {
  const athensAddress = '3690 Atlanta Hwy #107, Athens, GA 30606';
  const gainesvilleAddress = '1237 Thompson Bridge Rd, Gainesville, GA 30501';
  if (order.caterer.address.city === 'Athens') {
    return athensAddress;
  } else if (order.caterer.address.city === 'Gainesville') {
    return gainesvilleAddress;
  } else {
    return 'Address not provided';
  }
}

function getAddressObject(order: IEzManageOrder): {
  company_address_str: string;
  company_address_city_st_zip: string;
} {
  // if (order.caterer.address.city === 'Athens') {
  //   return {
  //     company_address_str: '3690 Atlanta Hwy #107',
  //     company_address_city_st_zip: 'Athens, GA 30606',
  //   };
  // } else if (order.caterer.address.city === 'Gainesville') {
  //   return {
  //     company_address_str: '1237 Thompson Bridge Rd',
  //     company_address_city_st_zip: 'Gainesville, GA 30501',
  //   };
  // } else {
  //   return { company_address_str: '', company_address_city_st_zip: '' };
  // }
  return {
    company_address_str: 'PO Box 7698',
    company_address_city_st_zip: 'Athens, GA 30604',
  };
}

function getPhone(order: IEzManageOrder): string {
  // if (order.caterer.address.city === 'Athens') {
  //   return '(706) 613-8800';
  // } else if (order.caterer.address.city === 'Gainesville') {
  //   return '(770) 287-1773';
  // } else {
  //   return '';
  // }
  return '(706) 614-5590';
}
