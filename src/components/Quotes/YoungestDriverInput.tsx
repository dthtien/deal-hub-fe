import { Input, Typography } from "@material-tailwind/react";
import { QuoteProps } from "./types";
import DayInput from "../DayInput";
import { useMemo } from "react";

type YoungestDriverInputProps = {
  quote: QuoteProps;
  setQuote: React.Dispatch<React.SetStateAction<QuoteProps>>;
};

const YoungestDriverInput = ({ quote, setQuote }: YoungestDriverInputProps) => {
  const youngestDriver = useMemo(() => quote.youngest_driver || {}, [quote.youngest_driver]);

  return(
    <>
      <div>
        <Typography
          as="label"
          variant="h6"
          color="blue-gray"
          className="block mb-2 text-sm text-gray-900 dark:text-white"
        >
          Has younger driver?
        </Typography>
        <div className="grid grid-cols-2 gap-1 rounded-xl p-2">
          <div>
            <input
              type="radio"
              name="option"
              id='youngest-has-driver-yes'
              className="hidden"
              checked={quote.has_younger_driver}
              onChange={(_e) => setQuote({ ...quote, has_younger_driver: true })}
            />
            <label
              htmlFor='youngest-has-driver-yes'
              className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${quote.has_younger_driver && 'border-0 bg-gray-900 font-bold text-white'}`}
            >
              Yes
            </label>
          </div>
          <div>
            <input
              type="radio"
              name="option"
              id='youngest-has-driver-no'
              className="hidden"
              checked={!quote.has_younger_driver}
              onChange={(_e) => setQuote({ ...quote, has_younger_driver: false })}
            />
            <label
              htmlFor='youngest-has-driver-no'
              className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${ !quote.has_younger_driver && 'border-0 bg-gray-900 font-bold text-white'}`}
            >
             No
            </label>
          </div>
        </div>
      </div>

      {
        quote.has_younger_driver && (
          <>
            <div className="mb-6">
              <Typography
                as="label"
                variant="h6"
                color="blue-gray"
                className="block mb-2 text-sm text-gray-900 dark:text-white"
              >
                What type of licence does the youngest driver hold?
              </Typography>
              <div className="grid grid-cols-3 gap-1 rounded-xl p-2">
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='youngest-licence_type-full'
                    defaultValue="none"
                    className="hidden"
                    checked={youngestDriver.licence_type === 'full'}
                    onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_type: 'full' } })}
                  />
                  <label
                    htmlFor='youngest-licence_type-full'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.licence_type === 'full' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Full/Open licence
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='youngest-licence_type-provisional1'
                    defaultValue="none"
                    className="hidden"
                    checked={youngestDriver.licence_type === 'provisional1'}
                    onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_type: 'provisional1' } })}
                  />
                  <label
                    htmlFor='youngest-licence_type-provisional1'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.licence_type === 'provisional1' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Provisional 1 (P1)
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    name="option"
                    id='youngest-licence_type-provisional2'
                    defaultValue="none"
                    className="hidden"
                    checked={youngestDriver.licence_type === 'provisional2'}
                    onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_type: 'provisional2' } })}
                  />
                  <label
                    htmlFor='youngest-licence_type-provisional2'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.licence_type === 'provisional2' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Provisional 2 (P2)
                  </label>
                </div>

                <div>
                  <input
                    type="radio"
                    name="option"
                    id='youngest-licence_type-learners'
                    defaultValue="none"
                    className="hidden"
                    checked={youngestDriver.licence_type === 'learners'}
                    onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_type: 'learners' }})} />
                  <label
                    htmlFor='youngest-licence_type-learners'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.licence_type === 'learners' && 'border-0 bg-gray-900 font-bold text-white'}`}
                  >
                    Learners
                  </label>
                </div>
                <div>
                  <input
                    type="radio"
                    name="option"
                    id='youngest-licence_type-foreign'
                    defaultValue="none"
                    className="hidden"
                    checked={youngestDriver.licence_type === 'foreign'}
                    onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_type: 'foreign' }})}
                  />
                  <label
                    htmlFor='youngest-licence_type-foreign'
                    className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.licence_type === 'foreign' && 'border-0 bg-gray-900 font-bold text-white'}`}
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
                  Youngest driver gender
                </Typography>
                <div className="grid grid-cols-2 gap-1 rounded-xl p-2">
                  <div>
                    <input
                      type="radio"
                      name="option"
                      id='youngest-gender-male'
                      className="hidden"
                      checked={youngestDriver.gender === 'male'}
                      onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, gender: 'male' } })}
                    />
                    <label
                      htmlFor='youngest-gender-male'
                      className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.gender === 'male' && 'border-0 bg-gray-900 font-bold text-white'}`}
                    >
                      Male
                    </label>
                  </div>
                  <div>
                    <input
                      type="radio"
                      name="option"
                      id='youngest-gender-female'
                      className="hidden"
                      checked={youngestDriver.gender === 'female'}
                      onChange={(_e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, gender: 'female' } })}
                    />
                    <label
                      htmlFor='youngest-gender-female'
                      className={`block cursor-pointer border-2 border-gray-200 select-none rounded-xl p-2 text-center ${youngestDriver.gender === 'female' && 'border-0 bg-gray-900 font-bold text-white'}`}
                    >
                      Female
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
                  Youngest driver licence age
                </Typography>
                <Input
                  crossOrigin="youngest-licence_age"
                  id="youngest-licence_age"
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900 mt-2 pt-1"
                  type="number"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  placeholder="25"
                  value={youngestDriver.licence_age}
                  onChange={(e) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, licence_age: e.target.value } })}
                />
              </div>
              <div>
                <Typography
                  as="label"
                  variant="h6"
                  color="blue-gray"
                  className="block mb-2 text-sm text-gray-900 dark:text-white"
                >
                  Youngest driver date of birth
                </Typography>
                <DayInput
                  name="youngest-date_of_birth"
                  value={new Date()}
                  onChange={(value) => setQuote({ ...quote, youngest_driver: { ...quote.youngest_driver, dob: value } })}
                  showSelection
                />
              </div>
            </div>
          </>
        )
      }
    </>
  )
};

export default YoungestDriverInput;
