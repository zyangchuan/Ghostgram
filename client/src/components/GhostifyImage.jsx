import { useImageStore } from "../store/imageStore";
import eye from "../assets/eye.png"
import eyeClosed from "../assets/eye-closed.png"
import SampleImage from "../assets/sample.jpg"
import output from "../output.json"
import { useEffect, useState } from "react";

export default function GhostifyImage ({ children, onClick }) {
const { savedImageUrl, setSavedImage } = useImageStore()
const [regions, setRegions] = useState([])

useEffect(() => {
  setRegions(output.sensitive_regions.map(region => {
    region.hidden = false
    return region
  }))
}, [])

const handleHideRegion = async (region) => {
  // request.contents[0].parts[0].inlineData.data = region
  // const requestOptions = {
  //   method: "POST",
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(request),
  // };

  // try {
  //   const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDp5uBo3hJlMdMYJgEF4kOZGy-P159WIvU" ,requestOptions)
  //   if (!response.ok) {
  //     throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.message || 'Unknown error'}`);
  //   }

  //   const data = await response.json();
  //   console.log(data)
  // } catch (error) {
  //   console.error('Error uploading image:', error);
  //   throw error
  // }
  console.log(regions)
  setRegions(regions.map(r => {
    if (region === r) {
      r.hidden = !r.hidden
    }
    return r
  }))
}

return (
  <view className="w-full flex-1 flex flex-col">
    <image src={SampleImage} mode="aspectFill" auto-size className="w-96 rounded-xl" />
    <scroll-view scroll-orientation="vertical" className="flex-1 flex flex-col mt-2">
      {regions.map(region => (
        <view className="mb-3 w-full h-20 p-2 flex justify-between items-center rounded-xl shadow-md border-2 border-neutral-200">
          <text className="w-full font-semibold text-lg">{region.tag}</text>
          
          {!region.hidden 
            ? (<view bindtap={() => handleHideRegion(region)} className="w-44 p-2 flex justify-center items-center gap-2 bg-blue-100 rounded-lg">
                <image src={eye} className="w-7 h-7" tint-color="#60a5fa" />
                <text className="text-lg text-blue-400 font-semibold">Hide</text>
              </view>)
            : (<view bindtap={() => handleHideRegion(region)} className="w-44 p-2 flex justify-center items-center gap-2 bg-red-100 rounded-lg">
                <image src={eyeClosed} className="w-7 h-7" tint-color="#f87171" />
                <text className="text-lg text-red-400 font-semibold">Unhide</text>
              </view>)
          }
        </view>
      ))}
    </scroll-view>
  </view>
  )
}