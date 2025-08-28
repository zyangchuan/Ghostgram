import arrowLeft from "../assets/arrow-left.png";
import Button from '../components/Button'
import { useState, useEffect } from "@lynx-js/react"
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import image0 from "../assets/my_photos/image0.jpg"
import image1 from "../assets/my_photos/image1.jpeg"
import image2 from "../assets/my_photos/image2.jpeg"
import image3 from "../assets/my_photos/image3.jpg"
import image4 from "../assets/my_photos/image4.jpg"
import image5 from "../assets/my_photos/image5.webp"

import { FormData, File, Blob } from "formdata-polyfill/esm-min";
globalThis.FormData = FormData;

export default function Post() {
  
  const [image, setImage] = useState(null)
  const { id } = useParams()
  const images = [
      { id: 0, image: image0},
      { id: 1, image: image1},
      { id: 2, image: image2},
      { id: 3, image: image3},
      { id: 4, image: image4},
      { id: 5, image: image5},
    ]

  const ghostifyImage = async (image) => {
      const formdata = new FormData()
      formdata.append("files", image, "Haji lane 🇸🇬.jpg")

      const requestOptions = {
        method: "POST",
        body: { files: image },
        redirect: "follow"
      };

      fetch("http://0.0.0.0:8000/vl/audit", requestOptions)
        .then((response) => response.text())
        .then((result) => console.log(result))
        .catch((error) => console.error(error));
  };


  useEffect(async () => {
    try {  
      images.forEach(element => {
        if (element.id == id) {
          setImage(element.image)
        }
      });

      await ghostifyImage(image)
    } catch (error) {
      console.log(error)
    }
  })
  
  const nav = useNavigate()

  return (
    <view>
      <view className="w-10">
        <image bindtap={() => nav(-1)} src={arrowLeft} auto-size/>
      </view>
      <text className="font-bold text-4xl text-center">Ghostify</text>
      <view className="w-full h-full mt-5 flex flex-col items-center">
        <view>
          <image src={image} auto-size mode="aspectFill" className="w-96 rounded-xl" />
          <text className="text-2xl text-center font-bold text-neutral-400 mt-5 ">
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