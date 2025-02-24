import { Card, Input, Typography } from "@material-tailwind/react";
import VehicleRegisterDetails from "../VehicleRegisterDetails";
import CustomedSelect from "../CustomedSelect";
import { STATES } from "../Quotes/constants";
import { useState } from "react";

const CarsCheck = () => {
  const [plate, setPlate] = useState('');
  const [plateState, setPlateState] = useState('VIC');
  return (
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
            onChange={(value) => setPlateState(value)}
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
            onChange={(e) => setPlate(e.target.value)}
            required
          />
        </div>
      </div>
      {
        plate && plateState && (
          <VehicleRegisterDetails plate={plate} plateState={plateState} />
        )
      }
    </Card>
  );
}

export default CarsCheck;
