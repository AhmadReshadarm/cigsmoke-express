const niceInvoice = require('nice-invoice');
import axios from 'axios';
const getProducts = async (orderProducts: any) => {
  const products = await orderProducts.map(async (orderProduct: any) => {
    const product = await axios.get(`http://localhost:4002/products${orderProduct.productId}`);
    return {
      item: product.data.name,
      description: `${product.data.desc.slice(0, 70)}...`,
      quantity: orderProduct.qty,
      price: orderProduct.productPrice,
    };
  });
  return products;
};
const createInvoice = async (checkout: any) => {
  const invoiceDetail = {
    shipping: {
      name: 'Micheal',
      address: checkout.address.address,
      city: '_',
      state: '_',
      country: 'RU',
      postal_code: checkout.address.zipCode,
    },
    items: await getProducts(checkout.basket.orderProducts),

    subtotal: checkout.total,
    total: checkout.total,
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
      billing_date: checkout.createdAt,
    },
  };

  return niceInvoice(invoiceDetail, 'wuluxe.pdf');
};

export { createInvoice };
