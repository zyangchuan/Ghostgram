import { useNavigate } from 'react-router'
import Button from "../components/Button"
import { useImageStore } from "../store/imageStore"
import { usePostStore } from '../store/postStore';
import arrowLeft from "../assets/arrow-left.png";
import SampleImage from "../assets/sample.jpg"
import { useState } from "@lynx-js/react";
import descriptionRequest from "../descriptionRequeset.json"
import { useEffect } from 'react';

export default function App() {
  const { savedImageUrl } = useImageStore()
  const { addPost } = usePostStore()
  const nav = useNavigate();

  const [inputContent, setInputContent] = useState("");
  const [words, setWords] = useState([]);

  const handleAddPost = () => {
    addPost({ userName: "Han Sheng", imageUrl: savedImageUrl, description: inputContent })
    nav('/home')
  }

  function useDebounce(callback, delay, deps) {
    useEffect(() => {
      const handler = setTimeout(() => {
        callback()
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [...(deps || []), delay])
  }

  useDebounce(async () => {
    const regions = await handleTextRedaction()
    
    let words = []
    if (regions.length) {
      regions.forEach(region => words.push(region.text))
    }
    setWords(words)
    console.log(words)
    
  }, 2000, [inputContent])

  const handleTextRedaction = async () => {
    descriptionRequest.contents[0].parts[0].text += inputContent
    const request = JSON.stringify(descriptionRequest)
      
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: request,
      redirect: "follow"
    };
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDp5uBo3hJlMdMYJgEF4kOZGy-P159WIvU", requestOptions)
      const data = await response.json();
      const res = data.candidates[0].content.parts[0].text.replace(/```json\s*|\s*```/g, "");
      return res
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }
  
  return (
    <view className="flex flex-col flex-1">
      <view className="w-10 h-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="h-12 font-bold text-4xl text-center">Write a description</text>
      
      <view className="w-full pb-10 flex-1 flex flex-col items-center">
        <view className='w-full flex-1 flex flex-col'>
          <image src={SampleImage} mode="aspectFill" className="w-96 h-96 rounded-xl" />
          <view className="flex flex-col w-full h-32 px-2 mt-5 border-2">
            <textarea bindinput={(res) => {
                setInputContent(res.detail.value);
              }} placeholder="Write your description here..." className="flex-1 text-xl h-full font-bold" />
          </view>
          <view className='flex-1 w-full border-2'>
            <text className='font-bold text-red-300'>{res}</text>
          </view>
        </view>

        <view className="h-12 w-full flex justify-end">
          <Button onClick={() => handleAddPost()}>Post</Button>
        </view>
      </view>
    </view>
  )
}