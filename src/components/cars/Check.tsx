import { Card, Input, Typography } from "@material-tailwind/react";
import VehicleRegisterDetails from "../VehicleRegisterDetails";
import CustomedSelect from "../CustomedSelect";
import { STATES } from "../Quotes/constants";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const CarsCheck = () => {
  const [ searchParams ] = useSearchParams();
  const [plate, setPlate] = useState<string | undefined>('');
  const [plateState, setPlateState] = useState<string | undefined>('VIC');
  const [autoFetch, setAutoFetch] = useState<boolean>(false);

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(e.target.value);
    setAutoFetch(false);
  }

  const handleStateChange = (value: string | undefined) => {
    setPlateState(value);
    setAutoFetch(false);
  }

  useEffect(() => {
    const queryPlate = searchParams.get('plate');
    const queryState = searchParams.get('state');
    const isAutoFetch = searchParams.get('auto') === 'true';
    if (queryPlate) setPlate(queryPlate);
    if (queryState) setPlateState(queryState);
    if (isAutoFetch) setAutoFetch(true);
  }, [searchParams]);
  return (
    <>
      <Helmet>
        <title>Check Car Details</title>
        <meta name="description" content="Check car details" />
      </Helmet>
      <Card className="mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <div className="text-center">
          <Typography variant="h3" color="blue-gray" className="font-semibold">
            Check your car details
          </Typography>
          <Typography color="gray" className="mt-2 text-lg">
            Fill out the form below to get a car details
          </Typography>

          <Typography color="gray" className="mt-2 text-sm">
            This feature allows users to input relevant details into a form, and the system will use these values to fetch car details like make, model, badge, year, colour, fuel, and market value from an external API. The system will then display the fetched details to the user.
          </Typography>
        </div>
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
              value={plateState || 'VIC'}
              onChange={handleStateChange}
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
              value={plate}
              onChange={handlePlateChange}
              required
            />
          </div>
        </div>
        {
          plate && plateState && (
            <VehicleRegisterDetails plate={plate} plateState={plateState} showFeature autoFetch={autoFetch}/>
          )
        }
      </Card>
    </>
  );
}

export default CarsCheck;
