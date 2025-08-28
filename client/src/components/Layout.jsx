export default function Layout({ children }) {
  return (
    <view className="bg-neutral-100 min-h-screen text-center p-8 pt-16">
      <view>
        <text className='text-4xl font-semibold'>👻 Ghostgram</text>
      </view>
      <view className="mt-5">
        {children}
      </view>
    </view>
  )
}