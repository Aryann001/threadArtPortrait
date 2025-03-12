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
  const [pinCoords, setPinCoords] = useState([]);
  const fileInput = useRef(null);

  const drawStringArt = (lineSequence, pinCoords) => {
    const canvas = document.getElementById("canvasOutput");
    const ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    for (let i = 1; i < lineSequence.length; i++) {
      const prevPin = pinCoords[lineSequence[i - 1]];
      const currPin = pinCoords[lineSequence[i]];

      ctx.beginPath();
      ctx.lineWidth = 0.25
      ctx.moveTo(prevPin[0] * 2, prevPin[1] * 2);
      ctx.lineTo(currPin[0] * 2, currPin[1] * 2);
      ctx.stroke();
    }
  };

  const tempImgCall = async (formData) => {
    setReqSent(true);
    setLoadingDisplay("flex");
    const { data } = await axios.post("/api/v1/line-sequence", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    data && setReqSent(false);
    setLoadingDisplay("hidden");
    // console.log(data.lineSequence);
    setLineSequenceData(JSON.parse(data.lineSequence));
    setPinCoords(JSON.parse(data.pinCoords));
    drawStringArt(JSON.parse(data.lineSequence), JSON.parse(data.pinCoords));
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
                <p className="text-wrap text-default-500 text-[0.75rem] text-zinc-300">
                  &#x2022; File size should be less than 5mb
                </p>
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
              <div className="text-small md:w-[50%] w-[75%] self-center text-wrap text-default-500">
                <textarea
                  className="h-75 w-[100%] overflow-y-auto
                      [&::-webkit-scrollbar]:w-1
                      [&::-webkit-scrollbar-track]:rounded-full
                      [&::-webkit-scrollbar-track]:bg-gray-100
                      [&::-webkit-scrollbar-thumb]:rounded-full
                      [&::-webkit-scrollbar-thumb]:bg-gray-300
                      dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                      dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
                  defaultValue={JSON.stringify(lineSequenceData).replace(
                    /[\[\]']+/g,
                    ""
                  )}
                  disabled
                ></textarea>
              </div>
            )}
          </Form>
        </CardHeader>
        <CardBody className="overflow-visible w-[100%] flex items-center py-2">
          <canvas
            id="canvasOutput"
            width={1000}
            height={1000}
            className=" bg-white"
          ></canvas>
        </CardBody>
      </Card>
      <div
        className={`${loadingDisplay} fixed w-[100%] h-[100%] inset-0 bg-zinc-800 justify-center items-center`}
      >
        Loading...
      </div>
    </div>
  );
}
