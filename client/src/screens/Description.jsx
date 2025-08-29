import { useNavigate } from 'react-router'
import Button from "../components/Button"
import { useImageStore } from "../store/imageStore"
import { usePostStore } from '../store/postStore';
import arrowLeft from "../assets/arrow-left.png";
import SampleImage from "../assets/sample.jpg"
import { useState } from '@lynx-js/react';

export default function App() {
  const { savedImageUrl } = useImageStore()
  const { addPost } = usePostStore()
  const nav = useNavigate();

  const [inputContent, setInputContent] = useState("");

  const handleAddPost = () => {
    addPost({ userName: "Han Sheng", imageUrl: savedImageUrl, description: inputContent })
    nav('/home')
  }
  
  return (
    <view>
      <view className="w-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="font-bold text-4xl text-center">Write a description</text>
      
      <view className="w-full h-full mt-5 flex flex-col items-center">
        <view>
          <image src={savedImageUrl} mode="aspectFill" auto-size className="w-96 rounded-xl" />
          <view className="w-full h-52 px-2 mt-5">
            <textarea bindinput={(res) => {
                setInputContent(res.detail.value);
              }} placeholder="Write your description here..." className="text-xl h-full font-bold" />
          </view>
        </view>

        <view className="w-full flex justify-end">
          <Button onClick={() => handleAddPost()}>Next</Button>
        </view>
      </view>
    </view>
  )
}