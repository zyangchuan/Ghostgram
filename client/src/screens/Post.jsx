import arrowLeft from "../assets/arrow-left.png";
import Button from "../components/Button"
import { useState, useEffect } from "@lynx-js/react"
import { useNavigate } from 'react-router';
import request from "../request.json"
import { useImageStore } from "../store/imageStore";
import LoaderCircle from "../assets/loader-circle.png"
import GhostifyImage from "../components/GhostifyImage";

export default function Post() {
  const { savedImage, setSavedImage, savedImageUrl, setSavedImageUrl } = useImageStore()
  const [loading, setLoading] = useState(true)

  const imageBase64 = "data:image/jpeg;base64," + savedImage

  const ghostifyImage = async () => {
    request.contents[0].parts[0].inlineData.data = savedImage
    
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

      const data = await response.json();
      setSavedImageUrl(data.imageUrl)
      
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };


  useEffect(async () => {
    try {  
      // await ghostifyImage()
      // await uploadImage()
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }, [])
  
  const nav = useNavigate()

  return (
    <view className="flex-1 flex flex-col">
      <view className="w-10 h-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="h-10 font-bold text-4xl text-center">Ghostify</text>
      <view className="w-full pb-10 pt-2 flex-1 flex flex-col items-center">
        <view className="flex-1 flex flex-col">
          {loading 
          ? (<view className="w-96 h-96 bg-neutral-300 rounded-xl flex justify-center items-center">
              <image src={LoaderCircle} auto-size className="w-20 animate-spin" tint-color="#a3a3a3" />
            </view>)
          : <GhostifyImage />}
        </view>
        <view className="h-12 w-full flex justify-end">
          <Button onClick={() => nav('/post/description')}>Next</Button>
        </view>
      </view>
    </view>
  )
}