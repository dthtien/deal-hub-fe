export type ClaimProps = {
  at_fault: boolean;
  within_3_years: boolean;
  more_than_3_and_up_to_5_years_ago: boolean;
}

export type YoungestDriver = {
  gender: string;
  dob: string;
  licence_type: string;
  licence_age: string;
}
export type QuoteProps = {
  id?: string;
  policy_start_date: string | Date;
  current_insurer: string;
  state: string;
  suburb: string;
  postcode: string;
  address_line1: string;
  plate: string;
  plate_state?: string;
  financed: boolean;
  primary_usage: string;
  days_wfh: string;
  peak_hour_driving: boolean;
  cover_type: string;
  driver: {
    date_of_birth: string,
    gender: string,
    first_name: string,
    last_name: string,
    email: string,
    phone_number: string,
    licence_age: string
  };
  modified: boolean;
  driver_option: string;
  licence_type: string;
  parking: {
    type: string,
    indicator?: string
  };
  km_per_year: string;
  acknowledged: boolean;
  previous_claims?: ClaimProps[];
  youngest_driver?: Partial<YoungestDriver>;
  has_younger_driver?: boolean;
};
