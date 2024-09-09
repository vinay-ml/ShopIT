import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CheckoutSteps from "./CheckoutSteps";
import { calculateOrderCost } from "../../helpers/helpers";
import {
  useCreateNewOrderMutation,
  useStripeCheckoutSessionMutation,
} from "../../redux/api/orderApi";

const PaymentMethod = () => {
  const [method, setMethod] = useState("");
  const navigate = useNavigate();

  const { cartItems, shippingInfo } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const { itemsPrice, shippingPrice, taxPrice, totalPrice } =
    calculateOrderCost(cartItems);

  const [createNewOrder, { error, isSuccess }] = useCreateNewOrderMutation();

  const [
    stripeCheckoutSession,
    { data: checkoutData, error: checkoutError, isLoading },
  ] = useStripeCheckoutSessionMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (method === "COD") {
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        itemsPrice,
        shippingAmount: shippingPrice,
        taxAmount: taxPrice,
        totalAmount: totalPrice,
        paymentInfo: {
          status: "Not Paid",
        },
        paymentMethod: "COD",
      };
      await createNewOrder(orderData);
    }
    if (method === "Card") {
      const orderData = {
        shippingInfo,
        orderItems: cartItems,
        itemsPrice,
        shippingAmount: shippingPrice,
        taxAmount: taxPrice,
        totalAmount: totalPrice,
      };
      await stripeCheckoutSession(orderData);
    }
  };

  useEffect(() => {
    if (checkoutData) {
      window.location.href = checkoutData?.url;
      // navigate(checkoutData?.url);
    }
    if (checkoutError) {
      console.log(checkoutError);
      toast.error(checkoutError?.error);
    }
  }, [checkoutData, checkoutError]);

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.error);
    }
    if (isSuccess) {
      toast.success("Order Placed!");
      navigate("/me/orders?order_success=true");
    }
  }, [error, isSuccess]);

  return (
    <>
      <CheckoutSteps shipping confirmOrder payment />
      <div className="row wrapper">
        <div className="col-10 col-lg-5">
          <form
            className="shadow rounded bg-body"
            action="your_submit_url_here"
            method="post"
            onSubmit={submitHandler}
          >
            <h2 className="mb-4">Select Payment Method</h2>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="codradio"
                value="COD"
                onChange={(e) => setMethod("COD")}
              />
              <label className="form-check-label" htmlFor="codradio">
                Cash on Delivery
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="payment_mode"
                id="cardradio"
                value="Card"
                onChange={(e) => setMethod("Card")}
              />
              <label className="form-check-label" htmlFor="cardradio">
                Card - VISA, MasterCard
              </label>
            </div>

            <button
              id="shipping_btn"
              type="submit"
              className="btn py-2 w-100"
              disabled={isLoading}
            >
              CONTINUE
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;
