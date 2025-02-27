import { IconButton, Typography } from "@material-tailwind/react";
import { ClaimProps, QuoteProps } from "./types";
import { useMemo, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/16/solid";

const ClaimsInput = ({ quote, setQuote }: {
  quote: QuoteProps;
  setQuote: React.Dispatch<React.SetStateAction<QuoteProps>>;
}) => {
  const previousClaims = useMemo(() => quote.previous_claims || [], [quote.previous_claims]);

  const [claims, setClaims] = useState<ClaimProps[] | null >(previousClaims);
  const [isClaimed, setIsClaimed] = useState<boolean>(previousClaims.length > 0);

  const isShowAddClaim = useMemo(() => claims && claims.length < 5, [claims]);

  const handleClaimConfirmation = (value: boolean) => {
    setIsClaimed(value);
    setClaims(
      value ? [{ at_fault: false, within_3_years: false, more_than_3_and_up_to_5_years_ago: false }] : []
    );
  }


  const handleAddClaim = () => {
    if (!claims){
      return setClaims([{ at_fault: false, within_3_years: false, more_than_3_and_up_to_5_years_ago: false }]);
    }

    if (claims.length > 5) return;

    setClaims([...claims, { at_fault: false, within_3_years: false, more_than_3_and_up_to_5_years_ago: false }]);
  }

  return (
    <div>
      <div>
        <Typography
          as="label"
          variant="h6"
          color="blue-gray"
          className="block mb-2 text-sm text-gray-900 dark:text-white"
        >
          Have you made any claims in the last 5 years?
        </Typography>
        <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
          <div>
            <input
              type="radio"
              name="option"
              id='is-claimed-yes'
              className="peer hidden"
              checked={isClaimed}
              onChange={(_e) => handleClaimConfirmation(true)}
            />
            <label
              htmlFor='is-claimed-yes'
              className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${isClaimed && 'border-0 bg-gray-900 font-bold text-white'}`}
            >
              Yes
            </label>
          </div>
          <div>
            <input
              type="radio"
              name="option"
              id='is-claimed-no'
              defaultValue="3rd_party"
              checked={!isClaimed}
              className="peer hidden"
              onChange={(_e => handleClaimConfirmation(false))}
            />
            <label
              htmlFor="is-claimed-no"
              className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${!isClaimed && 'border-0 bg-gray-900 font-bold text-white'}`}
            >
              No
            </label>
          </div>
        </div>
      </div>
      {
        isClaimed && (
          <div className="p-3 border rounded">
            <Typography
              variant="h5"
              color="gray"
              className="font-semibold mb-2 text-center"
            >
              Claim details
            </Typography>
            {
              isShowAddClaim && (
                <IconButton
                  color="light-green"
                  onClick={handleAddClaim}
                  className="my-2"
                  ripple
                >
                  <PlusIcon className="w-5 h-5" />
                </IconButton>
              )
            }

            {
              claims && claims.map((claim, index) => (
                <div key={index} className="border rounded p-3 my-1">
                  <IconButton
                    color="red"
                    onClick={() => setClaims(claims.filter((_, i) => i !== index))}
                    className="float-right"
                    ripple
                  >
                    <MinusIcon className="w-5 h-5" />
                  </IconButton>
                  <div>
                    <Typography
                      as="label"
                      variant="h6"
                      color="blue-gray"
                      className="block mb-2 text-sm text-gray-900 dark:text-white"
                    >
                      Was the regular driver at fault?
                    </Typography>
                    <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
                      <div>
                        <input
                          type="radio"
                          name="option"
                          id='is-claimed-yes'
                          className="peer hidden"
                          checked={claim.at_fault}
                          onChange={(e) => {}}
                        />
                        <label
                          htmlFor='is-claimed-yes'
                          className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${ claim.at_fault  && 'border-0 bg-gray-900 font-bold text-white'}`}
                        >
                          Yes
                        </label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="option"
                          id='is-claimed-no'
                          checked={!claim.at_fault}
                          className="peer hidden"
                          onChange={(e) => {}}
                        />
                        <label
                          htmlFor="is-claimed-no"
                          className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${!claim.at_fault && 'border-0 bg-gray-900 font-bold text-white'}`}
                        >
                          No
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Typography
                      as="label"
                      variant="h6"
                      color="blue-gray"
                      className="block mb-2 text-sm text-gray-900 dark:text-white"
                    >
                      When was the claim made?
                    </Typography>
                    <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
                      <div>
                        <input
                          type="radio"
                          name="option"
                          id='is-claimed-within-3-years'
                          className="peer hidden"
                          checked={claim.within_3_years}
                          onChange={(e) => {}}
                        />
                        <label
                          htmlFor='is-claimed-within-3-years'
                          className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${claim.within_3_years && 'border-0 bg-gray-900 font-bold text-white'}`}
                        >
                          Within 3 years
                        </label>
                      </div>
                      <div>
                        <input
                          type="radio"
                          name="option"
                          id='is-claimed-more-than-3-and-up-to-5-years-ago'
                          checked={claim.more_than_3_and_up_to_5_years_ago}
                          className="peer hidden"
                          onChange={() => {}}
                        />
                        <label
                          htmlFor="is-claimed-no"
                          className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${ claim.more_than_3_and_up_to_5_years_ago && 'border-0 bg-gray-900 font-bold text-white'}`}
                        >
                          More than 3 and up to 5 years ago
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        )
      }
    </div>
  )
}

export default ClaimsInput;

