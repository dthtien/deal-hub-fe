import {
  Card,
  Input,
  Button,
  Typography,
  Spinner,
  Checkbox,
} from "@material-tailwind/react";
import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import DayInput from "../DayInput";
import CustomedSelect from "../CustomedSelect";
import LocationInput, { AddressItem } from "../LocationInput";
import VehicleRegisterDetails from "../VehicleRegisterDetails";
import { QuoteProps } from "./types";
import { DEFAULT_QUOTE, STATES } from "./constants";
import { useNavigate } from "react-router-dom";
import ClaimsInput from "./ClaimsInput";
import YoungestDriverInput from "./YoungestDriverInput";
import { Helmet } from "react-helmet-async";

function New() {
  const navigate = useNavigate();
  const handleCreateComplete = (data: QuoteProps) => navigate(`/quotes/${data.id}`);
  const { isLoading, fetchData } = useFetch<QuoteProps>({
    path: 'v1/insurances/quotes',
    requestOptions: {
      method: 'POST',
    },
    onComplete: handleCreateComplete
  });
  const [quote, setQuote] = useState<QuoteProps>(DEFAULT_QUOTE);
  const [error, setError] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quote?.driver.date_of_birth) {
      setError({ ...error, date_of_birth: 'Date of birth is required' });
      return;
    }

    setError({});
    fetchData({ quote });
  };

  const isShownAddress = false && quote.suburb && quote.postcode && quote.state && quote.address_line1;

  const handleAddressChange = (address: AddressItem) => {
    setQuote({
      ...quote,
      suburb: address.suburbName,
      postcode: address.postCode,
      state: address.state,
      address_line1: address.text,
    });
  }


  if (isLoading) <Spinner />;

  return (
    <>
      <Helmet>
        <title>Get a Quote</title>
        <meta name="description" content="Car insurance quote" />
      </Helmet>
      <Card className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="text-center">
          <Typography variant="h3" color="blue-gray" className="font-semibold">
            Get a Quote
          </Typography>
          <Typography color="gray" className="mt-2 text-lg">
            Fill out the form below to get a quick insurance quote.
          </Typography>

          <Typography color="gray" className="mt-2 text-sm">
            This feature allows users to input relevant details into a form, and the system will use these values to fetch car insurance data from multiple insurance providers. The goal is to provide users with a comprehensive comparison of available insurance plans, helping them make an informed decision.
          </Typography>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="my-4">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              What level of cover are you looking for?
            </Typography>
            <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='comprehensive'
                  defaultValue="comprehensive"
                  className="peer hidden"
                  checked={quote.cover_type === 'comprehensive'}
                  onChange={(_e) => setQuote({ ...quote, cover_type: 'comprehensive' })}
                />
                <label
                  htmlFor='comprehensive'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.cover_type === 'comprehensive' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Comprehensive
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='third_party'
                  defaultValue="3rd_party"
                  checked={quote.cover_type === '3rd_party'}
                  className="peer hidden"
                  onChange={(_e) => setQuote({ ...quote, cover_type: '3rd_party' })}
                />
                <label
                  htmlFor="third_party"
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.cover_type === '3rd_party' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Third Party Property Damage
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='3rd_party_fire_theft'
                  defaultValue="3rd_party_fire_theft"
                  checked={quote.cover_type === '3rd_party_fire_theft'}
                  className="peer hidden"
                  onChange={(_e) => setQuote({ ...quote, cover_type: '3rd_party_fire_theft' })}
                />
                <label
                  htmlFor="3rd_party_fire_theft"
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.cover_type === '3rd_party_fire_theft' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Third Party Fire & Theft
                </label>
              </div>
            </div>
          </div>
          {
            quote.plate && quote.plate_state && (
              <VehicleRegisterDetails plate={quote.plate} plateState={quote.plate_state} />
            )
          }
          <div className="grid gap-6 mb-6 md:grid-cols-2 my-2">
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Plate registration state
              </Typography>
              <CustomedSelect
                items={STATES}
                value={quote.plate_state || 'VIC'}
                onChange={(value) => setQuote({ ...quote, plate_state: value })}
                label="State"
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Car plate
              </Typography>
              <Input
                crossOrigin="plate"
                type="text"
                id="plate"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="ABC123"
                value={quote.plate}
                onChange={(e) => setQuote({ ...quote, plate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="grid gap-6 mb-6 md:grid-cols-2 my-2">
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Policy start date
              </Typography>
              <DayInput
                name="policy_start_date"
                value={new Date(quote.policy_start_date)}
                onChange={(value) => setQuote({ ...quote, policy_start_date: value })}
                required
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Current insurer
              </Typography>
              <Input
                crossOrigin="current_insurer"
                type="text"
                id="current_insurer"
                placeholder="AAMI"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={quote.current_insurer}
                onChange={(e) => setQuote({ ...quote, current_insurer: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              Where do you park your car at night?
            </Typography>
            <LocationInput onChange={handleAddressChange} required/>
          </div>

          {
            isShownAddress && (
              <div className="grid gap-6 mb-6 md:grid-cols-2 my-2">
                <div>
                  <Typography
                    as="label"
                    variant="h6"
                    color="blue-gray"
                    className="block mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    Address line 1
                  </Typography>
                  <Input
                    crossOrigin="address_line1"
                    type="text"
                    id="address_line1"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    placeholder="99 Esmond Street"
                    value={quote.address_line1}
                    onChange={(e) => setQuote({ ...quote, address_line1: e.target.value })}
                  />
                </div>
                <div>
                  <Typography
                    as="label"
                    variant="h6"
                    color="blue-gray"
                    className="block mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    State
                  </Typography>
                  <Input
                    crossOrigin="state"
                    type="text"
                    id="state"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    placeholder="VIC"
                    value={quote.state}
                    onChange={(e) => setQuote({ ...quote, state: e.target.value })}
                  />
                </div>
                <div>
                  <Typography
                    as="label"
                    variant="h6"
                    color="blue-gray"
                    className="block mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    Surburb
                  </Typography>
                  <Input
                    crossOrigin="suburb"
                    type="text"
                    id="Suburb"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    placeholder="Ardeer"
                    value={quote.suburb}
                    onChange={(e) => setQuote({ ...quote, suburb: e.target.value })}
                  />
                </div>
                <div>
                  <Typography
                    as="label"
                    variant="h6"
                    color="blue-gray"
                    className="block mb-2 text-sm text-gray-900 dark:text-white"
                  >
                    Postcode
                  </Typography>
                  <Input
                    crossOrigin="postcode"
                    type="text"
                    id="Postcode"
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    placeholder="3022"
                    value={quote.postcode}
                    onChange={(e) => setQuote({ ...quote, postcode: e.target.value })}
                  />
                </div>
              </div>
            )
          }

          <div className="grid gap-6 mb-6 md:grid-cols-2 my-4">
            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Has the car been modified?
              </Typography>
              <div className="grid grid-cols-2 gap-1 rounded-xl p-2">
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='modified-yes'
                    className="hidden"
                    checked={quote.modified}
                    onChange={(_e) => setQuote({ ...quote, modified: true })}
                  />
                  <label
                    htmlFor='modified-yes'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.modified && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Yes
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='modified-no'
                    className="peer hidden"
                    checked={!quote.modified}
                    onChange={(_e) => setQuote({ ...quote, modified: false })}
                  />
                  <label
                    htmlFor="modified-no"
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${!quote.modified && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    No
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Is there any finance on the car?
              </Typography>
              <div className="grid grid-cols-2 gap-1 rounded-xl p-2">
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='financed-yes'
                    className="hidden"
                    checked={quote.financed}
                    onChange={(_e) => setQuote({ ...quote, financed: true })}
                  />
                  <label
                    htmlFor='financed-yes'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.financed && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Yes
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='financed-no'
                    className="peer hidden"
                    checked={!quote.financed}
                    onChange={(_e) => setQuote({ ...quote, financed: false })}
                  />
                  <label
                    htmlFor="financed-no"
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${!quote.financed && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          <ClaimsInput quote={quote} setQuote={setQuote} />

          <div className="mb-6">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              How is the car used?
            </Typography>
            <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='primary_usage-private'
                  className="hidden"
                  checked={quote.primary_usage === 'private'}
                  onChange={(_e) => setQuote({ ...quote, primary_usage: 'private' })}
                />
                <label
                  htmlFor='primary_usage-private'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.primary_usage === 'private' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Private
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='primary_usage-ridesharing'
                  className="hidden"
                  checked={quote.primary_usage === 'ridesharing'}
                  onChange={(_e) => setQuote({ ...quote, primary_usage: 'ridesharing' })}
                />
                <label
                  htmlFor='primary_usage-ridesharing'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.primary_usage === 'ridesharing' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Private and Business
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='primary_usage-business'
                  className="hidden"
                  checked={quote.primary_usage === 'business'}
                  onChange={(_e) => setQuote({ ...quote, primary_usage: 'business' })}
                />
                <label
                  htmlFor='primary_usage-business'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.primary_usage === 'business' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Business
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-2 my-4">
            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Roughly how many kilometres is the car driven per year?
              </Typography>
              <Input
                crossOrigin="km_per_year"
                type="number"
                id="km_per_year"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="5,000"
                value={quote.km_per_year}
                onChange={(e) => setQuote({ ...quote, km_per_year: e.target.value })}
              />
            </div>
            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Is the car driven three or more weekdays, on average, between the following peak times?
              </Typography>
              <div className="grid grid-cols-2 gap-1 rounded-xl">
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='peak_hour_driving-yes'
                    className="hidden"
                    checked={quote.peak_hour_driving}
                    onChange={(_e) => setQuote({ ...quote, peak_hour_driving: true })}
                  />
                  <label
                    htmlFor='peak_hour_driving-yes'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.peak_hour_driving && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Yes
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='peak_hour_driving-no'
                    className="hidden"
                    checked={!quote.peak_hour_driving}
                    onChange={(_e) => setQuote({ ...quote, peak_hour_driving: false })}
                  />
                  <label
                    htmlFor="peak_hour_driving-no"
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${!quote.peak_hour_driving && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              Where is the car usually parked?
            </Typography>
            <div className="grid grid-cols-5 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='parking_type-garage'
                  defaultValue="garage"
                  className="hidden"
                  checked={quote.parking?.type === 'garage'}
                  onChange={(_e) => setQuote({ ...quote, parking: { ...quote.parking, type: 'garage' } })}
                />
                <label
                  htmlFor='parking_type-garage'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.parking?.type === 'garage' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Garage
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='parking_type-car_park'
                  defaultValue="car_park"
                  className="hidden"
                  checked={quote.parking?.type === 'car_park'}
                  onChange={(_e) => setQuote({ ...quote, parking: { ...quote.parking, type: 'car_park' } })}
                />
                <label
                  htmlFor='parking_type-car_park'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.parking?.type === 'car_park' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Car Park
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='parking_type-street'
                  defaultValue="street"
                  className="hidden"
                  checked={quote.parking?.type === 'street'}
                  onChange={(_e) => setQuote({ ...quote, parking: { ...quote.parking, type: 'street' } })}
                />
                <label
                  htmlFor='parking_type-street'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.parking?.type === 'street' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Street
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='parking_type-parking_lot'
                  defaultValue="parking_lot"
                  className="hidden"
                  checked={quote.parking?.type === 'parking_lot'}
                  onChange={(_e) => setQuote({ ...quote, parking: { ...quote.parking, type: 'parking_lot' } })}
                />
                <label
                  htmlFor='parking_type-parking_lot'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.parking?.type === 'parking_lot' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Parking Lot
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='parking_type-driveway'
                  defaultValue="driveway"
                  className="hidden"
                  checked={quote.parking?.type === 'driveway'}
                  onChange={(_e) => setQuote({ ...quote, parking: { ...quote.parking, type: 'driveway' } })}
                />
                <label
                  htmlFor='parking_type-driveway'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.parking?.type === 'driveway' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Driveway
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              How many days a week on average is the car used for trips to work or study?
            </Typography>
            <div className="grid grid-cols-5 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='days_wfh-0'
                  defaultValue="0"
                  className="hidden"
                  checked={quote.days_wfh === '0'}
                  onChange={(_e) => setQuote({ ...quote, days_wfh: '0' })}
                />
                <label
                  htmlFor='days_wfh-0'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.days_wfh === '0' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  0 Days
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='1_to_2'
                  defaultValue="1_to_2"
                  className="hidden"
                  checked={quote.days_wfh === '1_to_2'}
                  onChange={(_e) => setQuote({ ...quote, days_wfh: '1_to_2' })}
                />
                <label
                  htmlFor='1_to_2'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.days_wfh === '1_to_2' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  1 - 2 Days
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="option"
                  id='3_to_4'
                  defaultValue="3_to_4"
                  className="hidden"
                  checked={quote.days_wfh === '3_to_4'}
                  onChange={(_e) => setQuote({ ...quote, days_wfh: '3_to_4' })}
                />
                <label
                  htmlFor='3_to_4'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.days_wfh === '3_to_4' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  3 - 4 Days
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='5_plus'
                  defaultValue="5_plus"
                  className="hidden"
                  checked={quote.days_wfh === '5_plus'}
                  onChange={(_e) => setQuote({ ...quote, days_wfh: '5_plus' })}
                />
                <label
                  htmlFor='5_plus'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.days_wfh === '5_plus' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  5+ Days
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='days_wfh-none'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.days_wfh === 'none'}
                  onChange={(_e) => setQuote({ ...quote, days_wfh: 'none' })}
                />
                <label
                  htmlFor='days_wfh-none'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.days_wfh === 'none' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  I don't work or study
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              Do you want to exclude any drivers on the policy?
            </Typography>
            <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='driver_option-drivers_21'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.driver_option === 'drivers_21'}
                  onChange={(_e) => setQuote({ ...quote, driver_option: 'drivers_21' })}
                />
                <label
                  htmlFor='driver_option-drivers_21'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.driver_option === 'drivers_21' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Yes, all drivers will be 21 or over
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='driver_option-drivers_25'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.driver_option === 'drivers_25'}
                  onChange={(_e) => setQuote({ ...quote, driver_option: 'drivers_25' })}
                />
                <label
                  htmlFor='driver_option-drivers_25'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.driver_option === 'drivers_25' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Yes, all drivers will be 25 or over
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="option"
                  id='driver_option-none'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.driver_option === 'none'}
                  onChange={(_e) => setQuote({ ...quote, driver_option: 'none' })}
                />
                <label
                  htmlFor='driver_option-none'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.driver_option === 'none' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  No restrictions
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Typography
              as="label"
              variant="h6"
              color="blue-gray"
              className="block mb-2 text-sm text-gray-900 dark:text-white"
            >
              What type of licence does the regular driver hold?
            </Typography>
            <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
              <div>
                <input
                  type="radio"
                  name="option"
                  id='licence_type-full'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.licence_type === 'full'}
                  onChange={(_e) => setQuote({ ...quote, licence_type: 'full' })}
                />
                <label
                  htmlFor='licence_type-full'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.licence_type === 'full' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Full/Open licence
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='licence_type-provisional1'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.licence_type === 'provisional1'}
                  onChange={(_e) => setQuote({ ...quote, licence_type: 'provisional1' })}
                />
                <label
                  htmlFor='licence_type-provisional1'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.licence_type === 'provisional1' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Provisional 1 (P1)
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="option"
                  id='licence_type-provisional2'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.licence_type === 'provisional2'}
                  onChange={(_e) => setQuote({ ...quote, licence_type: 'provisional2' })}
                />
                <label
                  htmlFor='licence_type-provisional2'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.licence_type === 'provisional2' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Provisional 2 (P2)
                </label>
              </div>

              <div>
                <input
                  type="radio"
                  name="option"
                  id='licence_type-learners'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.licence_type === 'learners'}
                  onChange={(_e) => setQuote({ ...quote, licence_type: 'learners' })}
                />
                <label
                  htmlFor='licence_type-learners'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.licence_type === 'learners' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Learners
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  name="option"
                  id='licence_type-forgein'
                  defaultValue="none"
                  className="hidden"
                  checked={quote.licence_type === 'foreign'}
                  onChange={(_e) => setQuote({ ...quote, licence_type: 'foreign' })}
                />
                <label
                  htmlFor='licence_type-foreign'
                  className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.licence_type === 'foreign' && 'border-0 bg-gray-900 font-bold text-white'}`}
                >
                  Foreign Licence
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                First name
              </Typography>
              <Input
                crossOrigin="first_name"
                type="text"
                id="first_name"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="John"
                value={quote.driver?.first_name}
                onChange={(e) => setQuote({ ...quote, driver: { ...quote.driver, first_name: e.target.value } })}
                required
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Last name
              </Typography>
              <Input
                crossOrigin="last_name"
                id="last_name"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="Doe"
                value={quote.driver?.last_name}
                onChange={(e) => setQuote({ ...quote, driver: { ...quote.driver, last_name: e.target.value } })}
                required
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Gender
              </Typography>
              <div className="grid grid-cols-2 gap-1 rounded-xl p-2">
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='gender-male'
                    className="hidden"
                    checked={quote.driver?.gender === 'male'}
                    onChange={(_e) => setQuote({ ...quote, driver: { ...quote.driver, gender: 'male' } })}
                  />
                  <label
                    htmlFor='gender-male'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.driver?.gender === 'male' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Male
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='gender-female'
                    className="hidden"
                    checked={quote.driver?.gender === 'female'}
                    onChange={(_e) => setQuote({ ...quote, driver: { ...quote.driver, gender: 'female' } })}
                  />
                  <label
                    htmlFor='gender-female'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.driver?.gender === 'female' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Female
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Email address
              </Typography>
              <Input
                crossOrigin="email"
                type="email"
                id="email"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="john.doe@company.com"
                value={quote.driver?.email}
                onChange={(e) => setQuote({ ...quote, driver: { ...quote.driver, email: e.target.value } })}
                required={!quote.driver?.phone_number}
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Licence age
              </Typography>
              <Input
                crossOrigin="licence_age"
                id="licence_age"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                type="number"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="25"
                value={quote.driver?.licence_age}
                onChange={(e) => setQuote({ ...quote, driver: { ...quote.driver, licence_age: e.target.value } })}
              />
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Date of birth
              </Typography>
              <DayInput
                name="date_of_birth"
                value={new Date()}
                onChange={(value) => setQuote({ ...quote, driver: { ...quote.driver, date_of_birth: value } })}
                showSelection
              />
              {
                error?.date_of_birth && (
                  <Typography color="red" className="mt-2 text-sm">
                    {error.date_of_birth}
                  </Typography>
                )
              }
            </div>
            <div>
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                Phone number
              </Typography>
              <Input
                crossOrigin="phone"
                type="tel"
                id="phone"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                placeholder="123-45-678"
                pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
                value={quote.driver?.phone_number}
                onChange={(e) => setQuote({ ...quote, driver: { ...quote.driver, phone_number: e.target.value } })}
                required={!quote.driver?.email}
              />
            </div>
          </div>

          <YoungestDriverInput quote={quote} setQuote={setQuote} />

          <Checkbox
            crossOrigin="terms"
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center font-normal"
              >
                I agree the
                <a
                  target="_blank"
                  href="/terms_and_conditions"
                  className="font-medium transition-colors hover:text-gray-900"
                >
                  &nbsp;Terms and Conditions
                </a>
              </Typography>
            }
            checked={quote.acknowledged}
            onChange={(e) => setQuote({ ...quote, acknowledged: e.target.checked })}
            containerProps={{ className: "-ml-2.5" }}
            required
          />
          <div className="text-center">
            <Button
              type="submit"
              className="mt-2"
              disabled={isLoading}
            >
              Submit Quote
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

export default New;
