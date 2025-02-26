import useFetch from "./useFetch";

const useFetchCarRegisterDetails = <DataType>() => {
  const { data, isLoading, fetchData } = useFetch<DataType>({
    path: "/v1/insurances/car_registers",
  });

  return { data, isLoading, fetchData };
}

export default useFetchCarRegisterDetails;
