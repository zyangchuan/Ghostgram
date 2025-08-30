import { useImageStore } from "../store/imageStore";
import SampleImage from "../assets/sample.jpg"
import output from "../output.json"
import { useEffect, useState } from "react";
import GhostifyOption from "../components/GhostifyOption"
import { useRegionStore } from "../store/regionStore";

export default function GhostifyImage() {
const { savedImage, savedImageUrl, redactedImageUrl, setRedactedImageUrl } = useImageStore()
const { regions } = useRegionStore()
const [loading, setLoading] = useState(false) 

useEffect(() => {
  setLoading(true)
  setTimeout(() => {
    setLoading(false)
  }, 500)
},[redactedImageUrl])

return (
  <view className="w-full flex-1 flex flex-col">
    <view className="relative w-96 h-96">
      <view style={{ "opacity": loading ? 1 : 0 }}>
        <image src={savedImageUrl} className="z-10 absolute top-0 left-0 blur-sm w-96 h-96 rounded-xl" />
      </view>
      <image src={regions.length ? redactedImageUrl : savedImageUrl} mode="aspectFill" auto-size className="w-96 rounded-xl" />
    </view>
    <scroll-view scroll-orientation="vertical" className="flex-1 flex flex-col mt-2">
      {output.sensitive_regions.map(region => (
        <GhostifyOption region={region} />
      ))}
    </scroll-view>
  </view>
  )
}