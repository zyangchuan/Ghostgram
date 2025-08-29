import arrowLeft from "../assets/arrow-left.png";
import Button from "../components/Button"
import { useState, useEffect } from "@lynx-js/react"
import { useNavigate } from 'react-router';
import request from "../request.json"
import { useImageStore } from "../store/imageStore";
import LoaderCircle from "../assets/loader-circle.png"

export default function Post() {
  const { savedImage, setSavedImage } = useImageStore()
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(true)

  const imageBase64 = "data:image/jpeg;base64," + savedImage

  const ghostifyImage = async () => {
      request.contents[0].parts[0].inlineData.data = savedImage
      console.log(JSON.stringify(request))
      const requestOptions = {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      };

      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDp5uBo3hJlMdMYJgEF4kOZGy-P159WIvU" ,requestOptions)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${response.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log(data)
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error
      }

      
  };

  const uploadImage = async () => {
    try {
      const response = await fetch("http://ec2-13-215-248-76.ap-southeast-1.compute.amazonaws.com:5001/upload-image", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageBase64
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      setImageUrl(data.imageUrl)
      
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error
    }
  };


  useEffect(async () => {
    try {  
      await ghostifyImage()
      await uploadImage()
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, [])
  
  const nav = useNavigate()

  return (
    <view>
      <view className="w-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="font-bold text-4xl text-center">Ghostify</text>
      <view className="w-full h-full mt-5 flex flex-col items-center">
        <view>
          {loading 
          ? (<view className="w-96 h-96 bg-neutral-300 rounded-xl flex justify-center items-center">
              <image src={LoaderCircle} auto-size className="w-20 animate-spin" tint-color="#a3a3a3" />
            </view>)
          : <image src={imageUrl} mode="aspectFill" auto-size className="w-96 rounded-xl" />}

          <text className="text-2xl text-center font-bold text-neutral-300 mt-5">
            Tap on the ghosts to select the information you want to hide from strangers only
          </text>
        </view>
        <view className="mt-28 w-full flex justify-end">
          <Button bindtap={() => nav('/post/:id/description')}>Next</Button>
        </view>
      </view>
    </view>
  )
}