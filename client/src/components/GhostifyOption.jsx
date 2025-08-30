import eye from "../assets/eye.png"
import eyeClosed from "../assets/eye-closed.png"
import LoaderCircle from "../assets/loader-circle.png"
import { useState } from "@lynx-js/react";
import { useImageStore } from "../store/imageStore";
import { useRegionStore } from "../store/regionStore";
import { SERVER_BASE_URL } from "../config"

export default function Layout({ region }) {
  const { savedImage, setRedactedImageUrl } = useImageStore()
  const { regions, addRegion, removeRegion } = useRegionStore()
  const [loading, setLoading] = useState(false)

  const hideRegion = async regions => {

    const requestOptions = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: savedImage, sensitive_regions: regions }),
    };

    try {
      const response = await fetch(SERVER_BASE_URL + "/redact-image", requestOptions)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setRedactedImageUrl(data.imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error
    }
  }

  const handleHideRegion = async (region) => {
    if (regions.includes(region)) {
      const newRegions = regions.filter(r => r.tag !== region.tag)
      if (newRegions.length) {
        setLoading(true)
        await hideRegion(newRegions)
        setLoading(false)
      }
      removeRegion(region)
    } else {
      const newRegions = [...regions, region]
      setLoading(true)
      await hideRegion(newRegions)
      setLoading(false)
      addRegion(region)
    }
  }

  return (
    <view className="mb-3 w-full h-20 p-2 flex justify-between items-center rounded-xl shadow-md border-2 border-neutral-200">
      <view className="w-full">
        <text className="w-full font-semibold text-lg">{region.tag}</text>
        <text className="w-full font-semibold text-md text-red-400">{region.reason}</text>
      </view>
      
      {!regions.includes(region)
        ? (<view bindtap={() => handleHideRegion(region)} className="w-44 p-2 flex justify-center items-center bg-blue-100 rounded-lg">
            {loading 
              ? (<image src={LoaderCircle} auto-size className="w-7 h-7 animate-spin" tint-color="#60a5fa" />)
              : (<view className="flex gap-2 justify-center items-center">
                  <image src={eye} className="w-7 h-7" tint-color="#60a5fa" />
                  <text className="text-lg text-blue-400 font-semibold">Hide</text>
                </view>)}
          </view>)
        : (<view bindtap={() => handleHideRegion(region)} className="w-44 p-2 flex justify-center items-center bg-red-100 rounded-lg">
            {loading 
              ? (<image src={LoaderCircle} auto-size className="w-7 h-7 animate-spin" tint-color="#f87171" />)
              : (<view className="flex gap-2 justify-center items-center">
                  <image src={eyeClosed} className="w-7 h-7" tint-color="#f87171" />
                  <text className="text-lg text-red-400 font-semibold">Hide</text>
                </view>)}
          </view>)
      }
    </view>
  )
}



