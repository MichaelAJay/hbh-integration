export function validateEzManageOrder(order) {
  if (!order) return false;
  if (typeof order.orderNumber !== 'string') return false;
  if (typeof order.uuid !== 'string') return false;
  if (!validateEvent(order.event)) return false;
  if (!validateOrderCustomer(order.orderCustomer)) return false;
  if (!validateTotals(order.totals)) return false;
  if (!validateCatererCart(order.catererCart)) return false;
  return true;
}

function validateEvent(event) {
  return (
    event &&
    typeof event.timestamp === 'string' &&
    typeof event.timeZoneOffset === 'string'
  );
}

function validateOrderCustomer(orderCustomer) {
  return (
    orderCustomer &&
    (orderCustomer.firstName === null ||
      typeof orderCustomer.firstName === 'string') &&
    (orderCustomer.lastName === null ||
      typeof orderCustomer.lastName === 'string')
  );
}

function validateTotals(totals) {
  return (
    totals && validateSubunits(totals.subTotal) && validateSubunits(totals.tip)
  );
}

function validateSubunits(subunits) {
  return subunits && typeof subunits.subunits === 'number';
}

function validateCatererCart(catererCart) {
  return (
    catererCart &&
    Array.isArray(catererCart.feesAndDiscounts) &&
    catererCart.feesAndDiscounts.every(validateFeeAndDiscount) &&
    Array.isArray(catererCart.orderItems) &&
    catererCart.orderItems.every(validateOrderItem) &&
    validateCatererTotals(catererCart.totals)
  );
}

function validateFeeAndDiscount(feeAndDiscount) {
  return (
    feeAndDiscount &&
    typeof feeAndDiscount.name === 'string' &&
    validateSubunits(feeAndDiscount.cost)
  );
}

function validateOrderItem(orderItem) {
  return (
    orderItem &&
    typeof orderItem.quantity === 'number' &&
    typeof orderItem.name === 'string' &&
    validateSubunits(orderItem.totalInSubunits)
  );
}

function validateCatererTotals(catererTotals) {
  return catererTotals && typeof catererTotals.catererTotalDue === 'number';
}
