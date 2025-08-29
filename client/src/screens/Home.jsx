import SearchBar from "../components/SearchBar"
import plus from "../assets/plus.png"
import { useState } from '@lynx-js/react'
import { useNavigate } from 'react-router'
import { requestPhotoAuth, pickPhoto } from '../native/PhotoPicker'
import { useImageStore } from '../store/imageStore';


export default function Home() {
  const [status, setStatus] = useState('unknown')
  const [image, setImage] = useState(null)
  const { savedImage, setSavedImage } = useImageStore();

  const nav = useNavigate();

  const askPermission = async () => {
    const status = await requestPhotoAuth()
    setStatus(status)
  }

  const chooseOne = async () => {
    const b64 = await pickPhoto()
    setImage(b64)
    setSavedImage(b64)
  }

  const handlePhotoSelection = async () => {
    await askPermission()
    await chooseOne()
    nav('/post')
  }

  return (
    <view className="relative">
      <SearchBar />
      
      {/* Make post button */}
      <view className="w-full fixed bottom-20 flex justify-center">
        <view bindtap={() => handlePhotoSelection()} className="bg-black shadow-md w-24 h-16 p-2 flex justify-center rounded-xl">
          <image src={plus} auto-size tint-color="#FFFFFF" />
        </view>
      </view>
      {/* Make post button */}

    </view>
  )
}