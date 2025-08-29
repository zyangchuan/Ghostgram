export default function Layout({ children }) {
  return (
    <view className="bg-neutral-100 h-screen flex flex-col px-8 pt-16">
      <view className="h-16">
        <text className='text-4xl font-semibold'>👻 Ghostgram</text>
      </view>
      <view className="flex-1 flex flex-col">
        {children}
      </view>
    </view>
  )
}