export type InvoiceFlowInvoiceItem = {
  name: string;
  description: string;
  quantity: number;
  amount: number;
  price: string;
};

export type InvoiceFlowInvoiceBill = {
  name: string;
  value: number;
};

export type InvoiceFlowInvoiceData = {
  company_name: string;
  company_address: string;
  company_contact: string;
  company_logo: string;
  customer_name: string;
  customer_address: string;
  customer_contact: string;
  invoice_number: string;
  invoice_date: string;
  payment_terms: string;
  invoice_items: InvoiceFlowInvoiceItem[];
  invoice_bills: InvoiceFlowInvoiceBill[];
  total_amount: number;
  notes: string;
  // Added
  customer_company: string;
  order_date: string;
  due_date: string;
  subtotal: string;
  tax: string;
  delivery_fee: string;
  tip: string;
  discounts_fees: string;
  total: string;
  company_address_str: string;
  company_address_city_st_zip: string;
  company_phone: string;
};
