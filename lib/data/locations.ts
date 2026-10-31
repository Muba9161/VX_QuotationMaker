/**
 * Locations Dataset & Cascading Utilities
 * Provides local zero-overhead lookup for Countries, States/Provinces, and Cities.
 * Supports India (all 36 States & UTs with major commercial hubs) and international markets.
 */

export interface LocationCountry {
  name: string;
  code: string;
  states: Record<string, string[]>;
}

export const LOCATIONS_DATA: Record<string, Record<string, string[]>> = {
  India: {
    "Uttar Pradesh": [
      "Noida",
      "Greater Noida",
      "Lucknow",
      "Kanpur",
      "Agra",
      "Varanasi",
      "Prayagraj",
      "Ghaziabad",
      "Meerut",
      "Bareilly",
      "Aligarh",
      "Moradabad",
      "Saharanpur",
      "Gorakhpur",
      "Ayodhya",
      "Jhansi",
      "Mathura",
    ],
    Maharashtra: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Thane",
      "Navi Mumbai",
      "Nashik",
      "Aurangabad (Chhatrapati Sambhajinagar)",
      "Solapur",
      "Kolhapur",
      "Amravati",
    ],
    Delhi: [
      "New Delhi",
      "Central Delhi",
      "South Delhi",
      "North Delhi",
      "East Delhi",
      "West Delhi",
      "Dwarka",
      "Connaught Place",
    ],
    Karnataka: [
      "Bengaluru",
      "Mysuru",
      "Mangaluru",
      "Hubballi-Dharwad",
      "Belagavi",
      "Kalaburagi",
      "Davanagere",
      "Ballari",
      "Udupi",
    ],
    "Tamil Nadu": [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
      "Erode",
      "Vellore",
      "Thoothukudi",
    ],
    Telangana: [
      "Hyderabad",
      "Warangal",
      "Nizamabad",
      "Karimnagar",
      "Ramagundam",
      "Khammam",
    ],
    Gujarat: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Gandhinagar",
      "Junagadh",
      "Anand",
    ],
    "West Bengal": [
      "Kolkata",
      "Howrah",
      "Durgapur",
      "Asansol",
      "Siliguri",
      "Bardhaman",
      "Kalyani",
    ],
    Haryana: [
      "Gurugram",
      "Faridabad",
      "Panipat",
      "Ambala",
      "Karnal",
      "Rohtak",
      "Hisar",
      "Sonipat",
      "Panchkula",
    ],
    Rajasthan: [
      "Jaipur",
      "Jodhpur",
      "Kota",
      "Bikaner",
      "Ajmer",
      "Udaipur",
      "Bhilwara",
      "Alwar",
    ],
    "Madhya Pradesh": [
      "Bhopal",
      "Indore",
      "Gwalior",
      "Jabalpur",
      "Ujjain",
      "Sagar",
      "Dewas",
      "Satna",
    ],
    Punjab: [
      "Ludhiana",
      "Amritsar",
      "Jalandhar",
      "Patiala",
      "Bathinda",
      "Mohali (SAS Nagar)",
    ],
    Kerala: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Thrissur",
      "Kollam",
      "Palakkad",
      "Kannur",
      "Alappuzha",
    ],
    "Andhra Pradesh": [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Tirupati",
    ],
    Bihar: [
      "Patna",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Purnia",
      "Darbhanga",
    ],
    Odisha: [
      "Bhubaneswar",
      "Cuttack",
      "Rourkela",
      "Berhampur",
      "Sambalpur",
      "Puri",
    ],
    Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon"],
    Chandigarh: ["Chandigarh"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    Uttarakhand: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rishikesh"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    Ladakh: ["Leh", "Kargil"],
    Puducherry: ["Puducherry", "Karaikal", "Ozhukarai"],
    Tripura: ["Agartala"],
    Meghalaya: ["Shillong"],
    Manipur: ["Imphal"],
    Nagaland: ["Kohima", "Dimapur"],
    Mizoram: ["Aizawl"],
    Sikkim: ["Gangtok"],
    "Arunachal Pradesh": ["Itanagar"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    Lakshadweep: ["Kavaratti"],
  },

  "United Arab Emirates": {
    Dubai: ["Dubai Downtown", "Business Bay", "DIFC", "JLT", "Deira"],
    "Abu Dhabi": ["Abu Dhabi City", "Al Ain", "Al Dhafra", "Yas Island"],
    Sharjah: ["Sharjah City", "Khor Fakkan", "Kalba"],
    Ajman: ["Ajman City"],
    "Ras Al Khaimah": ["Ras Al Khaimah City"],
    Fujairah: ["Fujairah City"],
    "Umm Al Quwain": ["Umm Al Quwain City"],
  },

  "United States": {
    California: ["San Francisco", "San Jose", "Los Angeles", "San Diego", "Sacramento", "Palo Alto", "Mountain View"],
    "New York": ["New York City", "Brooklyn", "Manhattan", "Buffalo", "Albany", "Rochester"],
    Texas: ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth", "Plano"],
    Washington: ["Seattle", "Bellevue", "Redmond", "Tacoma", "Spokane"],
    Illinois: ["Chicago", "Naperville", "Aurora", "Rockford"],
    Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    Massachusetts: ["Boston", "Cambridge", "Worcester", "Somerville"],
  },

  "United Kingdom": {
    England: ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Cambridge", "Oxford"],
    Scotland: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee"],
    Wales: ["Cardiff", "Swansea", "Newport"],
    "Northern Ireland": ["Belfast", "Derry"],
  },

  Singapore: {
    Singapore: ["Central Area", "Marina Bay", "Jurong East", "Tampines", "Woodlands", "Changi"],
  },

  Canada: {
    Ontario: ["Toronto", "Ottawa", "Mississauga", "Waterloo", "Hamilton"],
    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond"],
    Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau"],
    Alberta: ["Calgary", "Edmonton", "Red Deer"],
  },

  Australia: {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
    Victoria: ["Melbourne", "Geelong", "Ballarat"],
    Queensland: ["Brisbane", "Gold Coast", "Cairns"],
    "Western Australia": ["Perth", "Fremantle"],
  },

  Germany: {
    Berlin: ["Berlin"],
    Bavaria: ["Munich", "Nuremberg", "Augsburg"],
    Hesse: ["Frankfurt am Main", "Wiesbaden", "Kassel"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen"],
    Hamburg: ["Hamburg"],
  },
};

export const COUNTRIES_LIST = Object.keys(LOCATIONS_DATA);

export function getCountriesList(): string[] {
  return COUNTRIES_LIST;
}

export function getStatesForCountry(country?: string | null): string[] {
  if (!country) return [];
  const matchedKey = Object.keys(LOCATIONS_DATA).find(
    (c) => c.toLowerCase() === country.trim().toLowerCase()
  );
  if (!matchedKey) return [];
  return Object.keys(LOCATIONS_DATA[matchedKey] || {});
}

export function getCitiesForState(country?: string | null, state?: string | null): string[] {
  if (!country || !state) return [];
  const matchedCountryKey = Object.keys(LOCATIONS_DATA).find(
    (c) => c.toLowerCase() === country.trim().toLowerCase()
  );
  if (!matchedCountryKey) return [];

  const statesMap = LOCATIONS_DATA[matchedCountryKey] || {};
  const matchedStateKey = Object.keys(statesMap).find(
    (s) => s.toLowerCase() === state.trim().toLowerCase()
  );
  if (!matchedStateKey) return [];

  return statesMap[matchedStateKey] || [];
}

