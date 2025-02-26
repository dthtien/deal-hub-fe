import { useState } from "react";
import { StandardFeature } from "./VehicleRegisterDetails";
import { Input, Typography } from "@material-tailwind/react";

const VehicleFeatures = ({ features }: { features:StandardFeature[]}) => {
  const [search, setSearch] = useState("");

  if (!features || features.length === 0) return null;

  const filteredFeatures = features.filter(
    (feature) =>
      feature.code.toLowerCase().includes(search.toLowerCase()) ||
        feature.label.toLowerCase().includes(search.toLowerCase())
  );

  return(
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
  )
};

export default VehicleFeatures;
