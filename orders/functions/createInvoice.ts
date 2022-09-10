const niceInvoice = require('nice-invoice');
import axios from 'axios';
import { Checkout, OrderProduct } from 'core/entities';
const getProducts = async (orderProducts: OrderProduct[]) => {
  const products = [];
  for (const orderProduct of orderProducts) {
    const product = await axios.get(`${process.env.CATALOG_DB}/products/${orderProduct.productId}`);
    products.push({
      item: product.data.name,
      description: `${product.data.desc.slice(0, 70)}...`,
      quantity: orderProduct.qty,
      price: orderProduct.productPrice,
      tax: '',
    });
  }

  return products;
};
const createInvoice = async (checkout: Checkout, user: { name: string }) => {
  const invoiceDetail = {
    shipping: {
      name: user.name,
      address: checkout.address.address,
      city: '_',
      state: '_',
      country: 'RU',
      postal_code: checkout.address.zipCode,
    },
    items: await getProducts(checkout.basket.orderProducts),

    subtotal: checkout.totalAmount,
    total: checkout.totalAmount,
    order_number: checkout.id,
    header: {
      company_name: 'Wuluxe',
      company_address: 'МО, г. Люберцы, Октябрьский проспект 181',
    },
    footer: {
      text: 'wuluxe.ru',
    },
    currency_symbol: '₽',
    date: {
      billing_date: new Date(checkout.createdAt).toLocaleDateString('ru-RU'),
    },
  };
  return invoiceDetail;
  // return niceInvoice(invoiceDetail, 'wuluxe.pdf');
};

export { createInvoice };
