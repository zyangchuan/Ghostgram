import searchLogo from "../assets/user-round-search.png";

export default function SearchBar() {
  return (
    <view className="flex w-full h-12 p-2 bg-gray-200 rounded-xl">
      <image src={searchLogo} mode="aspectFill" auto-size className="opacity-30" />
      <input placeholder="Search users" className="w-full h-full font-semibold text-xl ml-3" />
    </view>
  )
}