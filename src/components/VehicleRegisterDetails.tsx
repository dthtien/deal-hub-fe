import { Button, IconButton, Spinner, Tooltip, Typography } from "@material-tailwind/react";
import useFetch from "../hooks/useFetch";
import VehicleFeatures from "./VehicleFeatures";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ShareIcon } from "@heroicons/react/20/solid";

type VehicleRegisterDetailsProps = {
  plate: string;
  plateState: string;
  showFeature?: boolean;
  autoFetch?: boolean;
};

type DetailsItem = {
  code: string;
  label: string;
};

export type StandardFeature = {
  code: string;
  label: string;
};

type CarRegisterDetails = {
  badge: DetailsItem;
  body: DetailsItem;
  colour: DetailsItem;
  fuel: DetailsItem;
  make: DetailsItem;
  model: DetailsItem;
  marketValue: number;
  year: string;
  vehicleDescription: string;
  standardFeatures: StandardFeature[];
};

const CarInformation = ({ data, showFeature }: { data: CarRegisterDetails, showFeature: boolean }) => (
  <>
    {/* Car Info */}
    <Typography variant="h5" color="blue-gray" className="font-semibold mb-2">
      {`${data.make.label} ${data.model.label} ${data.badge.label} ${data.year}`}
    </Typography>
    <Typography className="text-gray-600">{`${data.colour.label} - ${data.fuel.label}`}</Typography>
    <Typography className="mt-2 text-gray-700">{data.vehicleDescription}</Typography>

    {/* Market Value */}
    <div className="mt-4">
      <Button
        disabled
        className="bg-gray-100 text-gray-700 cursor-not-allowed py-2 px-4 rounded-md text-sm font-medium"
      >
        $ <strong>{data.marketValue.toLocaleString()}</strong> (Estimated)
      </Button>
    </div>

    {/* Standard Features */}
    {showFeature && (<VehicleFeatures features={data.standardFeatures} />)}
  </>
)

const VehicleRegisterDetails = ({
  plate, plateState, showFeature = false, autoFetch = false
}: VehicleRegisterDetailsProps) => {
  const [_, setSearchParams] = useSearchParams();
  const [isCopied, setIsCopied] = useState(false);
  const { data, isLoading, fetchData, error } = useFetch<CarRegisterDetails>({
    path: "/v1/insurances/car_registers",
  });

  useEffect(() => {
    if (autoFetch) fetchData({ plate, plate_state: plateState });
  }, [autoFetch]);

  const handleCheckCarDetails = () => {
    fetchData({ plate, plate_state: plateState });
    setSearchParams({ plate, state: plateState });
  }


  const copyToClipboard = () => {
    const currentHost = window.location.host;

    navigator.clipboard.writeText(`${currentHost}/cars/check?plate=${plate}&state=${plateState}&auto=true`)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      })
      .catch(err => console.error("Failed to copy: ", err));
  };


  if (isLoading)
    return (
      <div className="flex justify-center items-center py-6">
        <Spinner color="blue" className="w-10 h-10" />
      </div>
    );

  return (
    <>
      <div className="text-center">
        <Typography color="gray" className="mb-3 text-sm">
          By clicking the button below, you agree to our
          <a
            target="_blank"
            href="/terms_and_conditions"
            className="font-medium transition-colors hover:text-gray-900"
          >
            &nbsp;Terms and Conditions
          </a>.

        </Typography>
        <Button
          className="py-3 mb-2 rounded-md text-sm font-medium"
          onClick={handleCheckCarDetails}
        >
          Check Car Details
        </Button>
      </div>

      {
        data && (
          <div className="text-right">
            <Tooltip
              color="blue"
              content="URL copied!"
              position="top"
              open={isCopied}
            >
              <IconButton
                onClick={copyToClipboard}
                className="mb-2"
              >
                <ShareIcon className="w-6 h-6" />
              </IconButton>
            </Tooltip>
          </div>
        )
      }
      {
        data && <CarInformation data={data} showFeature={showFeature} />
      }

      {
        error && (
          <Typography color="red" className="text-center">
            {error.message}
          </Typography>
        )
      }
    </>
  );
};

export default VehicleRegisterDetails;
