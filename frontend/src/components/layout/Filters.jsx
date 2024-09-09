import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPriceQueryParams } from "../../helpers/helpers";
import { PRODUCT_CATEGORIES } from "../../constants/constants";
import StarRatings from "react-star-ratings";

const Filters = () => {
  const [min, setMin] = useState();
  const [max, setMax] = useState();

  const navigate = useNavigate();
  let [searchParams] = useSearchParams();

  useEffect(() => {
    searchParams.has("min") && setMin(searchParams.get("min"));
    searchParams.has("max") && setMax(searchParams.get("max"));
  }, []);

  // Handle Price Filter
  const handleButtonClick = (e) => {
    e.preventDefault();

    searchParams = getPriceQueryParams(searchParams, "min", min);
    searchParams = getPriceQueryParams(searchParams, "max", max);

    const path = window.location.pathname + "?" + searchParams.toString();
    navigate(path);
  };

  //Handle Category & Rating filter
  const handleClick = (checkbox) => {
    const checkboxes = document.getElementsByName(checkbox.name);

    checkboxes.forEach((item) => {
      if (item !== checkbox) item.checked = false;
    });

    // If the checkbox is checked, update or add the filter
    if (checkbox.checked) {
      // Set new filter value if already there
      if (searchParams.has(checkbox.name)) {
        searchParams.set(checkbox.name, checkbox.value);
      } else {
        // Append new filter
        searchParams.append(checkbox.name, checkbox.value);
      }
    } else {
      // Delete filter from query if unchecked
      if (searchParams.has(checkbox.name)) {
        searchParams.delete(checkbox.name);
      }
    }

    const path = window.location.pathname + "?" + searchParams.toString();
    navigate(path);
  };

  const defaultHandler = (checkboxType, checkboxValue) => {
    return searchParams.get(checkboxType) === checkboxValue.toString();
  };

  return (
    <div className="border p-3 filter">
      <h3>Filters</h3>
      <hr />
      <h5 className="filter-heading mb-3">Price</h5>
      <form id="filter_form" className="px-2" onSubmit={handleButtonClick}>
        <div className="row">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Min ($)"
              name="min"
              value={min}
              onChange={(e) => setMin(e.target.value)}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Max ($)"
              name="max"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
          <div className="col">
            <button type="submit" className="btn btn-primary">
              GO
            </button>
          </div>
        </div>
      </form>
      <hr />
      <h5 className="mb-3">Category</h5>
      {PRODUCT_CATEGORIES.map((category) => (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="category"
            id="check4"
            value={category}
            defaultChecked={defaultHandler("category", category)}
            onClick={(e) => handleClick(e.target)}
          />
          <label className="form-check-label" for="check4">
            {category}
          </label>
        </div>
      ))}

      <hr />
      <h5 className="mb-3">Ratings</h5>
      {[5, 4, 3, 2, 1].map((rating) => (
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="ratings"
            id={`check-${rating}`}
            value={rating}
            checked={defaultHandler("ratings", rating)}
            onClick={(e) => handleClick(e.target)}
          />
          <label className="form-check-label" htmlFor={`check-${rating}`}>
            <StarRatings
              rating={rating}
              starRatedColor="#ffb829"
              numberOfStars={5}
              name="rating"
              starDimension="21px"
              starSpacing="1px"
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default Filters;
