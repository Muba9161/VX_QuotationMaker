"use client";

import React, { useMemo } from "react";
import {
  getCountriesList,
  getStatesForCountry,
  getCitiesForState,
} from "@/lib/data/locations";

interface CascadingLocationSelectProps {
  country: string;
  state: string;
  city: string;
  onChange: (updated: { country: string; state: string; city: string }) => void;
  disabled?: boolean;
}

export default function CascadingLocationSelect({
  country = "India",
  state = "",
  city = "",
  onChange,
  disabled = false,
}: CascadingLocationSelectProps) {
  const countries = useMemo(() => getCountriesList(), []);
  const states = useMemo(() => getStatesForCountry(country), [country]);
  const cities = useMemo(() => getCitiesForState(country, state), [country, state]);

  const handleCountryChange = (newCountry: string) => {
    onChange({
      country: newCountry,
      state: "",
      city: "",
    });
  };

  const handleStateChange = (newState: string) => {
    onChange({
      country,
      state: newState,
      city: "",
    });
  };

  const handleCityChange = (newCity: string) => {
    onChange({
      country,
      state,
      city: newCity,
    });
  };

  // Ensure legacy or custom values appear in the options if not in predefined list
  const stateOptions = useMemo(() => {
    if (state && !states.some((s) => s.toLowerCase() === state.toLowerCase())) {
      return [state, ...states];
    }
    return states;
  }, [state, states]);

  const cityOptions = useMemo(() => {
    if (city && !cities.some((c) => c.toLowerCase() === city.toLowerCase())) {
      return [city, ...cities];
    }
    return cities;
  }, [city, cities]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "13px",
    color: "#0f172a",
    backgroundColor: disabled ? "#f8fafc" : "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "4px",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
      {/* 1. Country Selection */}
      <div>
        <label style={labelStyle}>Country</label>
        <div style={{ position: "relative" }}>
          <select
            value={country || "India"}
            onChange={(e) => handleCountryChange(e.target.value)}
            disabled={disabled}
            style={inputStyle}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {country && !countries.includes(country) && (
              <option value={country}>{country}</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. State / Province Selection */}
      <div>
        <label style={labelStyle}>State / Province</label>
        <div style={{ position: "relative" }}>
          {stateOptions.length > 0 ? (
            <select
              value={state || ""}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={disabled}
              style={inputStyle}
            >
              <option value="">-- Select State --</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={state || ""}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g. State / Region"
              style={inputStyle}
            />
          )}
        </div>
      </div>

      {/* 3. City Selection */}
      <div>
        <label style={labelStyle}>City</label>
        <div style={{ position: "relative" }}>
          {cityOptions.length > 0 ? (
            <select
              value={city || ""}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={disabled}
              style={inputStyle}
            >
              <option value="">-- Select City --</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={city || ""}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g. City Name"
              style={inputStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

