import React from "react";
import MetaData from "../layout/MetaData";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCartItems, removeCartItem } from "../../redux/features/cartSlice";

const Cart = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const increseQty = (item, quantity) => {
    const newQty = quantity + 1;
    if (newQty > item?.stock) return;
    setItemsToCart(item, newQty);
  };

  const decreseQty = (item, quantity) => {
    const newQty = quantity - 1;
    if (newQty <= 0) return;
    setItemsToCart(item, newQty);
  };

  const setItemsToCart = (item, newQty) => {
    const cartItem = {
      product: item?.product,
      name: item?.name,
      price: item?.price,
      image: item?.image,
      stock: item?.stock,
      quantity: newQty,
    };
    dispatch(setCartItems(cartItem));
  };

  const removeCartItemHandler = (id) => {
    dispatch(removeCartItem(id));
  };

  const checkoutHandler = () => {
    navigate("/shipping");
  };

  return (
    <>
      <MetaData title={"Your Cart"} />
      {cartItems?.length === 0 ? (
        <h2 className="mt-5">Your cart is Empty</h2>
      ) : (
        <>
          <h2 className="mt-5">
            Your cart:<b>{cartItems?.length} items</b>
          </h2>
          <div className="row d-flex justify-content-between">
            <div className="col-12 col-lg-8">
              {cartItems?.map((item) => (
                <React.Fragment key={item.product}>
                  <hr />
                  <div className="cart-item" data-key="product1">
                    <div className="row">
                      <div className="col-4 col-lg-3">
                        <img
                          src={item?.image}
                          alt={item?.name}
                          height="90"
                          width="115"
                        />
                      </div>
                      <div className="col-5 col-lg-3">
                        <Link to={`/products/${item?.product}`}>
                          {item?.name}
                        </Link>
                      </div>
                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p id="card_item_price"> ${item?.price}</p>
                      </div>
                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="stockCounter d-inline">
                          <span
                            className="btn btn-danger minus"
                            onClick={() => decreseQty(item, item?.quantity)}
                          >
                            {" "}
                            -{" "}
                          </span>
                          <input
                            type="number"
                            className="form-control count d-inline"
                            value={item?.quantity}
                            readOnly
                          />
                          <span
                            className="btn btn-primary plus"
                            onClick={() => increseQty(item, item?.quantity)}
                          >
                            {" "}
                            +{" "}
                          </span>
                        </div>
                      </div>
                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <i
                          id="delete_cart_item"
                          className="fa fa-trash btn btn-danger"
                          onClick={() => removeCartItemHandler(item?.product)}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <hr />
                </React.Fragment>
              ))}
            </div>
            <div className="col-12 col-lg-3 my-4">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />
                <p>
                  Units:{" "}
                  <span className="order-summary-values">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                    (Units)
                  </span>
                </p>
                <p>
                  Est. total:{" "}
                  <span className="order-summary-values">
                    $
                    {cartItems
                      .reduce(
                        (acc, item) => acc + item.quantity * item.price,
                        0
                      )
                      .toFixed(2)}
                  </span>
                </p>
                <hr />
                <button
                  id="checkout_btn"
                  className="btn btn-primary w-100"
                  onClick={checkoutHandler}
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
