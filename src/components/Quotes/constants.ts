import { QuoteProps } from "./types";

export const DEFAULT_QUOTE: QuoteProps = {
  policy_start_date: new Date(),
  current_insurer: '',
  state: '',
  suburb: '',
  postcode: '',
  address_line1: '',
  plate: '',
  plate_state: 'VIC',
  modified: false,
  financed: false,
  primary_usage: 'private',
  days_wfh: '1_to_2',
  peak_hour_driving: false,
  cover_type: 'comprehensive',
  km_per_year: '5000',
  driver_option: 'drivers_21',
  driver: {
    date_of_birth: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    licence_age: '25',
    gender: 'male'
  },
  parking: {
    type: 'garage',
  }
};

export const STATES = [
  {
    label: 'Victoria',
    value: 'VIC'
  },
  {
    label: 'New South Wales',
    value: 'NSW'
  },
  {
    label: 'Queensland',
    value: 'QLD'
  },
  {
    label: 'South Australia',
    value: 'SA'
  },
  {
    label: 'Western Australia',
    value: 'WA'
  },
  {
    label: 'Tasmania',
    value: 'TAS'
  },
  {
    label: 'Northern Territory',
    value: 'NT'
  },
  {
    label: 'Australian Capital Territory',
    value: 'ACT'
  }
]

