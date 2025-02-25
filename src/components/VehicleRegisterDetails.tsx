import { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner, Typography, Input } from "@material-tailwind/react";
import useFetch from "../hooks/useFetch";

type VehicleRegisterDetailsProps = {
  plate: string;
  plateState: string;
  showFeature?: boolean;
};

type DetailsItem = {
  code: string;
  label: string;
};

type StandardFeature = {
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

const VehicleRegisterDetails = ({ plate, plateState, showFeature = false }: VehicleRegisterDetailsProps) => {
  const { data, isLoading, fetchData } = useFetch<CarRegisterDetails>({
    path: "/v1/insurances/car_registers",
  });

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (plate.length >= 5) fetchData({ plate, plate_state: plateState });
  }, [plate, plateState]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-6">
        <Spinner color="blue" className="w-10 h-10" />
      </div>
    );

  if (!data) return null;

  // Filter standard features based on search input
  const filteredFeatures = data.standardFeatures.filter(
    (feature) =>
      feature.code.toLowerCase().includes(search.toLowerCase()) ||
      feature.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="mt-5 p-4 shadow-lg rounded-lg border border-gray-200">
      <CardBody>
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
        {showFeature && data.standardFeatures.length > 0 && (
          <div className="mt-6">
            <Typography variant="h6" color="gray" className="font-semibold mb-2">
              Standard Features
            </Typography>

            {/* Search Input */}
            <div className="mb-3">
              <Input
                crossOrigin="search"
                type="text"
                placeholder="Search features..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            {/* Feature Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 shadow-sm">
                <thead className="bg-gray-100">
                  <tr className="border-b border-gray-300">
                    <th className="px-4 py-2 text-left text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left text-gray-700">Label</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeatures.length > 0 ? (
                    filteredFeatures.map((feature, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-800">{feature.code}</td>
                        <td className="px-4 py-2 text-gray-800">{feature.label}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-4 py-2 text-center text-gray-500">
                        No features found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default VehicleRegisterDetails;
