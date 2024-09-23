import React, { useState, useEffect } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button"; // Import Button from MUI
import { useTranslation } from "react-i18next"; // Import the hook
import "./filter.css";

const FilterBar = ({ onFilterChange }) => {
  const { t } = useTranslation(); // Use the hook to access the translation function

  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");

  useEffect(() => {
    onFilterChange({
      city,
      category,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
    });
  }, [city, category, minPrice, maxPrice, minCapacity, maxCapacity]);

  // Use t() to translate city and category options
  const westBankCities = [
    "Ramallah",
    "Nablus",
    "Hebron",
    "Bethlehem",
    "Jericho",
    "Jenin",
    "Tulkarm",
    "Qalqilya",
    "Salfit",
    "Tubas",
    "Azzun",
    "Beit_Jala",
    "Beit_Sahour",
    "Dura",
    "Halhul",
    "Yatta",
  ];

  const categories = [
    { value: "", label: "--" },
    { value: "PARTIES", label: t("categories.PARTIES") }, // Use translation for categories
    { value: "MEETINGS", label: t("categories.MEETINGS") },
    { value: "FUNERALS", label: t("categories.FUNERALS") },
    { value: "BIRTHDAYS", label: t("categories.BIRTHDAYS") },
    { value: "WEDDINGS", label: t("categories.WEDDINGS") },
  ];

  // Handler to clear all filters
  const handleClear = () => {
    setCity("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinCapacity("");
    setMaxCapacity("");
  };

  return (
    <div className="filter-bar-container-modern">
      <div className="filter-bar-modern">
        <div className="filter-bar-label-modern">{t("advanced_search")}</div>{" "}
        {/* Translated "Advanced Search" */}
        <FormControl variant="filled" className="form-control-modern">
          <InputLabel id="city-select-label-modern">{t("city")}</InputLabel>{" "}
          {/* Translated "City" */}
          <Select
            labelId="city-select-label-modern"
            id="city-select-modern"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {/* "Select a city" option - resets the selection */}
            <MenuItem value="">
              {t("select_a_city")} {/* Translated "Select a city" */}
            </MenuItem>

            {westBankCities.map((cityKey) => (
              <MenuItem key={cityKey} value={cityKey}>
                {t(`west_bank_cities.${cityKey}`)} {/* Translated city */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="filled" className="form-control-modern">
          <InputLabel id="category-select-label-modern">
            {t("category")}
          </InputLabel>{" "}
          {/* Translated "Category" */}
          <Select
            labelId="category-select-label-modern"
            id="category-select-modern"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                {category.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label={t("min_price")} // Translated "Min Price"
          variant="filled"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("max_price")} // Translated "Max Price"
          variant="filled"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("min_capacity")} // Translated "Min Capacity"
          variant="filled"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("max_capacity")} // Translated "Max Capacity"
          variant="filled"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          className="text-field-modern"
        />
        {/* Clear Button */}
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClear}
          sx={{
            marginTop: "20px",
            width: "100%",
            background: "linear-gradient(90deg, #ff7e5f, #feb47b)", // Gradient background
            color: "#fff", // White text color
            fontWeight: "bold", // Bold text
            fontSize: "1rem", // Larger font size
            padding: "10px 20px", // Padding for a larger button
            borderRadius: "30px", // Rounded corners
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)", // Box shadow for depth
            transition: "all 0.3s ease", // Smooth transition for hover effects
            "&:hover": {
              background: "linear-gradient(90deg, #feb47b, #ff7e5f)", // Reverse gradient on hover
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)", // More intense shadow on hover
              transform: "translateY(-2px)", // Slight lift on hover
            },
          }}
        >
          {t("clear_filters")} {/* Translated "Clear Filters" */}
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
