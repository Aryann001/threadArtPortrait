"use client";
import {
  Card,
  CardHeader,
  CardBody,
  Image,
  Form,
  Input,
  Button,
} from "@heroui/react";
import axios from "axios";
import { useRef, useState } from "react";

export default function Home() {
  const [action, setAction] = useState(null);
  const [reqSent, setReqSent] = useState(false);
  const [loadingDisplay, setLoadingDisplay] = useState("hidden");
  const [lineSequenceData, setLineSequenceData] = useState(null);
  const fileInput = useRef(null);

  const tempImgCall = async (formData) => {
    setReqSent(true);
    setLoadingDisplay("flex");
    const { data } = await axios.post("/api/v1/line-sequence", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    data && setReqSent(false);
    setLoadingDisplay("hidden");
    // console.log(data.lineSequence);
    setLineSequenceData(data.lineSequence);
  };

  return (
    <div className="grid relative bg-zinc-800 items-center justify-items-center min-h-screen">
      <Card className="py-4 w-[75%] flex items-center justify-center gap-[3rem]">
        <CardHeader className="pb-0 pt-2 px-4 flex-col">
          <Form
            className="w-full flex flex-col gap-[2.5rem]"
            onSubmit={(e) => {
              e.preventDefault();
              let data = Object.fromEntries(new FormData(e.currentTarget));

              // console.log(image);
              // console.log(data);
              tempImgCall(data);
              setAction(`submit ${JSON.stringify(data)}`);
            }}
          >
            <div className="w-[100%] md:gap-0 gap-[2rem] flex md:flex-row flex-col justify-between">
              <Input
                isRequired
                className=" mr-[1em] border-r-zinc-800 border-r-2"
                errorMessage="Please enter a number"
                name="numberOfNails"
                placeholder="Enter number of nails"
                type="number"
              />

              <Input
                isRequired
                className=" mr-[1em] border-r-zinc-800 border-r-2"
                errorMessage="Please enter a number"
                name="numberOfThreads"
                placeholder="Enter number of threads"
                type="number"
              />

              <Input
                isRequired
                className=" mr-[1em] border-r-zinc-800 border-r-2"
                errorMessage="Please enter a number"
                name="lineWeight"
                placeholder="Enter Line Weight"
                type="number"
              />

              <div className=" flex flex-col gap-[1rem]">
                <Input
                  isRequired
                  errorMessage="Please enter a valid file"
                  name="image"
                  placeholder="Enter a file"
                  type="file"
                  ref={fileInput}
                  accept="image/*"
                />
                <p className="text-wrap text-default-500 text-[0.75rem] text-zinc-300">&#x2022;  File size should be less than 5mb</p>
              </div>
            </div>
            <div className="flex gap-2 self-center">
              <Button
                className=" bg-zinc-500 rounded-xl px-[1rem] py-[0.5rem] hover:bg-zinc-400 text-black"
                type="submit"
                isDisabled={reqSent}
                disableRipple={reqSent}
              >
                Submit
              </Button>
            </div>
            {lineSequenceData && (
              <div className="text-small w-[50%] self-center text-wrap text-default-500">
                <textarea
                  className="h-75 w-[100%] overflow-y-auto
                      [&::-webkit-scrollbar]:w-1
                      [&::-webkit-scrollbar-track]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                  defaultValue={lineSequenceData.replace(/[\[\]']+/g, "")}
                  disabled
                ></textarea>
              </div>
            )}
          </Form>
        </CardHeader>
        <CardBody className="overflow-visible w-[100%] flex items-center py-2">
          {/* <Image
            alt="Card background"
            className="object-cover rounded-xl"
            // src={image}
            width={270}
          /> */}
        </CardBody>
      </Card>
      <div
        className={`${loadingDisplay} w-[100%] h-[100%] inset-0 bg-zinc-800 absolute justify-center items-center`}
      >
        Loading...
      </div>
    </div>
  );
}
