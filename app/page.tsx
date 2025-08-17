"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DropDown from "../components/DropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import Toggle from "../components/Toggle";
import { countries,vibes } from "./data/data";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState("");
  const [vibe, setVibe] = useState<string>("Professional");
  const [ country , setCountry] = useState<string>("Pick Location");
  const [generatedBios, setGeneratedBios] = useState<string>("");
  const [isLlama, setIsLlama] = useState(false);

  const bioRef = useRef<null | HTMLDivElement>(null);

  const scrollToBios = () => {
    if (bioRef.current !== null) {
      bioRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };


const prompt = `Generate exactly 3 ${vibe === "Casual" ? "relaxed" : vibe === "Funny" ? "funny" : "professional"} Twitter biographies. 
- Label them "1.", "2.", and "3." exactly. 
- Do NOT include hashtags. 
- Each bio must be under 300 characters and must be 3 bios returned. 
- Use short, punchy Twitter-style sentences. 
- Include the ${country} flag and mention living there and any fun fact about the country. 
${vibe === "Funny" ? "- Make them humorous." : ""}
- Incorporate this context: ${bio}${bio.slice(-1) === "." ? "" : "."}
- Only return these 3 bios, nothing else. Ensure all three are generated.`;


  const generateBio = async (e:any) => {
    e.preventDefault()
    setLoading(true)
  console.log("Calling the Gemini API");


  const APIBody = {
    contents: [
      {
        parts: [
          {
            text:
              prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 400,
      topP: 1.0,
    },
  };

  await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
      process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(APIBody),
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      setGeneratedBios(data.candidates[0].content.parts[0].text.trim());
      setLoading(false)
      scrollToBios();

    })
    .catch((err) => {
      console.error("Error calling Gemini API:", err);
    });
}


  return (
    <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
        <p className="border rounded-2xl py-1 px-4 text-slate-500 text-sm mb-5 hover:scale-105 transition duration-300 ease-in-out">
          <b>126,657</b> bios generated so far
        </p>
        <h1 className="sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900">
          Generate your next Twitter bio using AI
        </h1>
        <div className="mt-7">
          <Toggle isGPT={isLlama} setIsGPT={setIsLlama} />
        </div>

        <div className="max-w-xl w-full">
          <div className="flex mt-10 items-center space-x-3">
            <Image
              src="/1-black.png"
              width={30}
              height={30}
              alt="1 icon"
              className="mb-5 sm:mb-0"
            />
            <p className="text-left font-medium">
              Drop in your job{" "}
              <span className="text-slate-500">(or your favorite hobby)</span>.
            </p>
          </div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            placeholder={"e.g. Amazon CEO"}
          />
           <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your Location</p>
          </div>
          <div className="block mb-5">
            <DropDown option={country} setOption={(country) => setCountry(country)} options={countries} />
          </div>
          <div className="flex mb-5 items-center space-x-3">
            <Image src="/2-black.png" width={30} height={30} alt="1 icon" />
            <p className="text-left font-medium">Select your vibe</p>
          </div>
          <div className="block">
            <DropDown option={vibe} setOption={(newVibe) => setVibe(newVibe)} options = {vibes} />
          </div>
          {loading ? (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              disabled
            >
              <LoadingDots color="white" style="large" />
            </button>
          ) : (
            <button
              className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
              onClick={(e) => generateBio(e)}
            >
              Generate your bio &rarr;
            </button>
          )}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
        <div className="space-y-10 my-10">
          {generatedBios && (
            <>
              <div>
                <h2
                  className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                  ref={bioRef}
                >
                  Your generated bios
                </h2>
              </div>
              <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                {generatedBios
                  .substring(generatedBios.indexOf("1") + 3)
                  .split(/2\.|3\./)
                  .map((generatedBio) => {
                    return (
                      <div
                        className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedBio);
                          toast("Bio copied to clipboard", {
                            icon: "✂️",
                          });
                        }}
                        key={generatedBio}
                      >
                        <p>{generatedBio}</p>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
