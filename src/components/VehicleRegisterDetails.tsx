import { useEffect } from "react";
import useFetch from "../hooks/useFetch";
import { Button, Card, CardBody, CardFooter, Spinner, Typography } from "@material-tailwind/react";

type VehicleRegisterDetailsProps = {
  plate: string;
  plateState: string;
};
type DetailsItem = {
  code: string;
  label: string;
}

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
}

const VehicleRegisterDetails = ({ plate, plateState }: VehicleRegisterDetailsProps) => {
  const { data, isLoading, fetchData } = useFetch<CarRegisterDetails>({
    path: '/v1/insurances/car_registers',
  });

  useEffect(() => {
    if (plate.length >=5 ) fetchData({ plate, plate_state: plateState });
  }, [plate, plateState]);

  if (isLoading) return <Spinner color="blue" />;

  if (!data) return null;

  return (
    <Card className="mt-3">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {`${data.make.label} ${data.model.label} ${data.badge.label} ${data.year} - ${data.colour.label} - ${data.fuel.label}`}
        </Typography>
        <Typography>{data.vehicleDescription}</Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <Button disabled>$ {data.marketValue} (Estimated)</Button>
      </CardFooter>
    </Card>
  );
}

export default VehicleRegisterDetails;
