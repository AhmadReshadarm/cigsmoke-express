import { AddressController } from "./address/address.controller";
import { BasketController } from "./basket/basket.controller";
import { CheckoutController } from "./checkout/checkout.controller";
import { OrderProductController } from "./orderProducts/orderProduct.controller";

const loadControllers = () => {
  return [
    OrderProductController,
    AddressController,
    BasketController,
    CheckoutController
  ];
}

export default loadControllers;
