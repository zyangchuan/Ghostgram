import { useNavigate } from 'react-router'
import Button from "../components/Button"
import { useImageStore } from "../store/imageStore"
import { usePostStore } from '../store/postStore';
import arrowLeft from "../assets/arrow-left.png";
import loadingCircle from "../assets/loader-circle.png"
import { useState } from "@lynx-js/react";
import descriptionRequest from "../descriptionRequest.json"
import { useEffect } from 'react';
import { useRegionStore } from '../store/regionStore';
import { GEMINI_API_KEY } from "../config"

export default function App() {
  const { savedImageUrl, redactedImageUrl } = useImageStore()
  const { regions, setRegions } = useRegionStore()
  const { addPost } = usePostStore()
  const [loading, setLoading] = useState(false)
  
  const nav = useNavigate();

  const [inputContent, setInputContent] = useState("");
  const [output, setOutput] = useState({});
  const [showSuggestion, setShowSuggestion] = useState(true)

  const handleAddPost = () => {
    addPost({ userName: "Yangchuan", relationship: "", imageUrl: regions.length ? redactedImageUrl : savedImageUrl, description: inputContent })
    setRegions([])
    nav('/home')
  }

  function useDebounce(callback, delay, deps) {
    useEffect(() => {
      setLoading(true)
      const handler = setTimeout(() => {
        callback()
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [...(deps || []), delay])
  }

  useDebounce(async () => {
    await handleTextRedaction()
  }, 2000, [inputContent])

  const handleTextRedaction = async () => {
    if (inputContent.length) {
      descriptionRequest.contents[0].parts[0].text += inputContent
      const request = JSON.stringify(descriptionRequest)
        
      const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: request,
        redirect: "follow"
      };
      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY, requestOptions)
        const data = await response.json();
        const res = data.candidates[0].content.parts[0].text.replace(/```json\s*|\s*```/g, "");
        
        setOutput(JSON.parse(res))
        setLoading(false)
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    } else {
      setLoading(false)
    }
  }

  const replaceDescription = () => {
    setInputContent(output.safe_text)
    setShowSuggestion(false)
  }
  
  return (
    <view className="flex flex-col flex-1">
      <view className="w-10 h-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="h-12 font-bold text-4xl text-center">Write a description</text>
      
      <view className="w-full pb-10 flex-1 flex flex-col items-center">
        <view className='w-full flex-1 flex flex-col items-center'>
          <image src={regions.length ? redactedImageUrl: savedImageUrl} mode="aspectFill" className="w-96 h-96 rounded-xl" />
          <view className="flex flex-col w-full h-32 px-2 mt-5">
            {showSuggestion
              ? (<textarea bindinput={(res) => {
                  setInputContent(res.detail.value);
                }} placeholder="Write your description here..." className="flex-1 text-xl h-full font-semibold" />)
              : (<view className='flex-1 text-xl h-full'>
                  <text className='flex-1 text-xl h-full font-semibold'>{inputContent}</text>
                </view>)
            }
            
          </view>
          <view className='flex-1 flex flex-col w-full'>
            {inputContent.length && showSuggestion
              ? (<view className='p-2 border-neutral-200 border-2 shaodw-xl rounded-xl flex flex-col'>
                  <view className='w-full flex justify-between'>
                    <text className='font-bold'>Suggested description</text>
                    <text className='font-bold text-neutral-400 text-sm'>Tap to replace</text>
                  </view>
                  {loading 
                    ? (<view className='w-full flex justify-center'>
                        <image src={loadingCircle} className='w-16 h-16 mt-5 animate-spin' tint-color="#d4d4d4" />
                      </view>)
                    : (<view bindtap={() => replaceDescription()} className='bg-red-200 rounded-lg p-2 mt-2'>
                        <text className='font-semibold text-red-500'>{output.safe_text}</text>
                      </view>)
                  }
                </view>) 
              : null
            }
            
          </view>
        </view>

        <view className="h-12 w-full flex justify-end">
          <Button onClick={() => handleAddPost()}>Post</Button>
        </view>
      </view>
    </view>
  )
}

// {
//   "safe_text": "Today I went shopping downtown and in a nearby vibrant area.",
//   "sensitive_regions": [
//     {
//       "type": "location",
//       "reason": "Specific shopping area identified by name.",
//       "text": "bugis"
//     },
//     {
//       "type": "location",
//       "reason": "Specific shopping area identified by name.",
//       "text": "haji lane"
//     }
//   ]
// }