import { useCallback, useEffect, useState } from '@lynx-js/react'
import { useNavigate } from 'react-router';
import Button from './components/Button'
import "./App.css";

export function App() {
  const nav = useNavigate();

  return (
    <view>
      <view className="bg-neutral-50 flex flex-col justify-center items-center min-h-screen text-center p-10">
        <view className='flex flex-col justify-center items-center gap-2'>
          <text style='font-size: 160px;'>👻</text>
          <text className='font-roboto font-bold text-6xl'>
            Ghostgram
          </text>
          <text className='mb-36 font-semibold text-neutral-400 text-2xl'>Post your moments without a trace</text>
          <Button onClick={() => nav('/home')}>Sign in with Google</Button>
        </view>
      </view>
    </view>
  )
}
