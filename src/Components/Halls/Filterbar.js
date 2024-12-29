import React, { useState, useEffect } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useTranslation } from "react-i18next";
import "./filter.css";

const FilterBar = ({ onFilterChange }) => {
  const { t } = useTranslation();

  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const userRole = localStorage.getItem("role") || ""; // Retrieve the user's role from localStorage
  const userId = localStorage.getItem("userId") || null; // Retrieve the user's ID from localStorage

  useEffect(() => {
    if (sortBy === "price" && !category) {
      alert(t("please_select_category"));
      setSortBy("");
    }
  }, [sortBy, category, t]);

  useEffect(() => {
    onFilterChange({
      city,
      category,
      minPrice,
      maxPrice,
      minCapacity,
      maxCapacity,
      startDate,
      endDate,
      sortBy,
      latitude,
      longitude,
      userId: sortBy === "recommended" ? userId : null, // Include userId only if sorting by recommendation
    });
  }, [
    city,
    category,
    minPrice,
    maxPrice,
    minCapacity,
    maxCapacity,
    startDate,
    endDate,
    sortBy,
    latitude,
    longitude,
    userId,
  ]);

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
    { value: "", label: t("select_category") },
    { value: "PARTIES", label: t("categories.PARTIES") },
    { value: "MEETINGS", label: t("categories.MEETINGS") },
    { value: "FUNERALS", label: t("categories.FUNERALS") },
    { value: "BIRTHDAYS", label: t("categories.BIRTHDAYS") },
    { value: "WEDDINGS", label: t("categories.WEDDINGS") },
  ];

  const handleClear = () => {
    setCity("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinCapacity("");
    setMaxCapacity("");
    setStartDate("");
    setEndDate("");
    setSortBy("");
    setLatitude(null);
    setLongitude(null);
  };

  const handleSortChange = (type) => {
    if (type === "location") {
      if (sortBy === "location") {
        setSortBy("");
        setLatitude(null);
        setLongitude(null);
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            setSortBy("location");
          },
          (error) => {
            alert(t("location_access_denied"));
            setSortBy("");
          }
        );
      }
    } else {
      setSortBy((prev) => (prev === type ? "" : type));
    }
  };

  return (
    <div className="filter-bar-container-modern">
      <div className="filter-bar-modern">
        <div className="filter-bar-label-modern">{t("advanced_search")}</div>
        <FormControlLabel
          control={
            <Checkbox
              checked={sortBy === "price"}
              onChange={() => handleSortChange("price")}
              style={{
                marginLeft: "15px",
                width: "20px",
                height: "20px",
                accentColor: "#c29d6d",
                transition: "transform 0.3s ease, background-color 0.3s ease",
              }}
            />
          }
          label={<span style={{ marginLeft: "10px" }}>{t("sort_by_price")}</span>}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={sortBy === "location"}
              onChange={() => handleSortChange("location")}
              style={{
                marginLeft: "15px",
                width: "20px",
                height: "20px",
                accentColor: "#c29d6d",
                transition: "transform 0.3s ease, background-color 0.3s ease",
              }}
            />
          }
          label={<span style={{ marginLeft: "10px" }}>{t("sort_by_location")}</span>}
        />
        {userRole === "CUSTOMER" && userId && (
          <FormControlLabel
            control={
              <Checkbox
                checked={sortBy === "recommended"}
                onChange={() => handleSortChange("recommended")}
                style={{
                  marginLeft: "15px",
                  width: "20px",
                  height: "20px",
                  accentColor: "#c29d6d",
                  transition: "transform 0.3s ease, background-color 0.3s ease",
                }}
              />
            }
            label={<span style={{ marginLeft: "10px" }}>{t("sort_by_recommended")}</span>}
          />
        )}
        <FormControl variant="filled" className="form-control-modern">
          <InputLabel id="city-select-label-modern">{t("city")}</InputLabel>
          <Select
            labelId="city-select-label-modern"
            id="city-select-modern"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <MenuItem value="">{t("select_a_city")}</MenuItem>
            {westBankCities.map((cityKey) => (
              <MenuItem key={cityKey} value={cityKey}>
                {t(`west_bank_cities.${cityKey}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="filled" className="form-control-modern">
          <InputLabel id="category-select-label-modern">
            {t("category")}
          </InputLabel>
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
          label={t("min_price")}
          variant="filled"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("max_price")}
          variant="filled"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("min_capacity")}
          variant="filled"
          value={minCapacity}
          onChange={(e) => setMinCapacity(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          label={t("max_capacity")}
          variant="filled"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          className="text-field-modern"
        />
        <TextField
          type="date"
          label={t("start_date")}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="text-field-modern"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          type="date"
          label={t("end_date")}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="text-field-modern"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Button
          variant="contained"
          color="secondary"
          onClick={handleClear}
          sx={{
            marginTop: "20px",
            width: "100%",
            background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
            padding: "10px 20px",
            borderRadius: "30px",
            boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(90deg, #feb47b, #ff7e5f)",
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.3)",
              transform: "translateY(-2px)",
            },
          }}
        >
          {t("clear_filters")}
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
