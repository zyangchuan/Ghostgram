export default function Button ({ children, onClick }) {
  return (<view bindtap={onClick} className='flex justify-center items-center p-4 px-6 bg-black rounded-xl'>
            <text className='text-2xl font-semibold text-neutral-200'>{children}</text>
          </view>)
}