export default function Layout({ children }) {
  return (
    <view className="bg-blue-50 min-h-screen text-center p-10 pt-16">
      <view>
        <text className='text-4xl font-semibold'>👻 Ghostgram</text>
      </view>
      <view className="mt-5">
        {children}
      </view>
    </view>
  )
}