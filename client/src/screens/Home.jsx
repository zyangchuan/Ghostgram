import SearchBar from "../components/SearchBar"
import Button from '../components/Button'
import plus from "../assets/plus.png"
import image0 from "../assets/my_photos/image0.jpg"
import image1 from "../assets/my_photos/image1.jpeg"
import image2 from "../assets/my_photos/image2.jpeg"
import image3 from "../assets/my_photos/image3.jpg"
import image4 from "../assets/my_photos/image4.jpg"
import image5 from "../assets/my_photos/image5.webp"
import { useState } from '@lynx-js/react'
import { useNavigate } from 'react-router'


export default function Home() {
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)

  const handlePhotoSelection = (id) => {
    nav(`/post/${id}`)
  }
  
  const nav = useNavigate();

  const images = [
    { id: 0, image: image0},
    { id: 1, image: image1},
    { id: 2, image: image2},
    { id: 3, image: image3},
    { id: 4, image: image4},
    { id: 5, image: image5},
  ]

  return (
    <view className="relative">
      <SearchBar />
      
      {/* Make post button */}
      <view className="w-full fixed bottom-20 flex justify-center">
        <view bindtap={() => setShowPhotoLibrary(true)} className="bg-black shadow-md w-24 h-16 p-2 flex justify-center rounded-xl">
          <image src={plus} auto-size tint-color="#FFFFFF" />
        </view>
      </view>
      {/* Make post button */}

      {showPhotoLibrary ? 
        <view className="w-full h-screen border-2 fixed flex justify-center items-center">
          <view className="w-11/12 h-1/2 p-5 bg-neutral-100 rounded-xl shadow-xl flex flex-col justify-between items-center">
            <view className="flex flex-col justify-center items-center">
              <text className="text-3xl font-semibold">Select your photo</text>
              <view className="h-80 overflow-hidden flex flex-wrap gap-1 mt-5">
                {images.map((image) => (
                  <view key={image.id} className="w-36 h-36 overflow-hidden">
                    <image bindtap={() => handlePhotoSelection(image.id)} src={image.image} auto-size mode="AspectFill" className="rounded-md" />
                  </view>))}
              </view>
            </view>
            <view className="w-full flex justify-end">
              <Button onClick={() => setShowPhotoLibrary(false)}>Cancel</Button>
            </view>
          </view>
        </view> : null}
    </view>
  )
}